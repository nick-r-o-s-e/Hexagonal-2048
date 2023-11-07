// Firebase: //
import {
  collection,
  getDocs,
  doc,
  setDoc,
  DocumentData,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { User, UserCredential, getAdditionalUserInfo } from "firebase/auth";

// Utils: //
import { RadiusStats, UserData, UserStats } from "../common/types";
import { db } from "./firebase-config";
import { DeepPartial } from "../common/types";
import { v4 as uuidv4 } from "uuid";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

const radiusInitStats = { wins: 0, best: 0 };

export const dbUserInitStats: UserStats = {
  radius2: radiusInitStats,
  radius3: radiusInitStats,
  radius4: radiusInitStats,
};

const getGuestStats = () => localStorage.getItem("guestStats");

export const getLeaderboardStats = async (userId?: string) => {
  return getDocs(collection(db, "leaderboard-stats"))
    .then((querySnapshot) => {
      return userId
        ? querySnapshot.docs.reduce((acc, red) => {
            return red.id == userId ? acc : [...acc, red.data()];
          }, [] as DocumentData[])
        : querySnapshot.docs.map((doc) => doc.data());
    })
    .catch(() => {
      throw new Error();
    });
};

export const setFirebaseUserStats = (
  id: string,
  data: DeepPartial<UserData>
) => {
  const docRef = doc(db, `leaderboard-stats/${id}`);

  setDoc(docRef, data, { merge: true });
};

export const usernameInUse = async (username: string) => {
  return await getDoc(doc(db, `usernames/${username}`))
    .then((snapshot) => snapshot.exists())
    .catch(() => {
      throw new Error("Failed to fetch existing usernames");
    });
};

export const addNewUser = async (res: UserCredential) => {
  const { user } = res;

  const docRef = doc(db, `leaderboard-stats/${user.uid}`);

  const displayName = user.displayName || getAdditionalUserInfo(res)?.username;

  const setNewUserDoc = async (username: string) => {
    return await setDoc(docRef, {
      username,
      stats: dbUserInitStats,
    }).then(
      //~~~ Because of the security rules check uniqueness of the specific field of the doc
      //~~~ without inefficiently reading whole collection is impossible, save username into separate collection using name as id,
      //~~~ to have ability for duplicate username validation
      async () =>
        await setDoc(doc(db, `usernames/${username}`), {}).catch(() => {
          throw new Error("Failed to add hame into usernames collection ");
        })
    );
  };

  if (displayName) {
    return usernameInUse(displayName)
      .then(async (nameExists) => {
        if (nameExists) {
          //~~~ If the username already in use save user with a unique name that user will be able to change in the future ~~~//
          return await setNewUserDoc(`User-${uuidv4()}`);
        } else {
          return await setNewUserDoc(displayName);
        }
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  } else {
    return await setNewUserDoc(`User-${uuidv4()}`);
  }
};

export const getUserData = async (
  currentUser: User | null | undefined
): Promise<UserData> => {
  const guestStats = getGuestStats();

  const initUserData = { username: "", stats: dbUserInitStats };

  if (currentUser) {
    return await getDoc(doc(db, `leaderboard-stats/${currentUser.uid}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          localStorage.removeItem("guestStats");

          return snapshot.data() as UserData;
        } else {
          throw new Error("User data from database is lost");
        }
      })
      .catch(() => {
        throw new Error("Failed to fetch user data from database");
      });
  } else {
    if (!guestStats) {
      localStorage.setItem("guestStats", JSON.stringify(initUserData));

      return initUserData;
    } else {
      return JSON.parse(guestStats);
    }
  }
};

export const storeUserStats = (
  radius: keyof UserStats,
  newStats: DeepPartial<RadiusStats>,
  currentUser: User | null | undefined
) => {
  const newRadiusStats = {
    [radius]: newStats,
  };

  if (currentUser) {
    setFirebaseUserStats(currentUser.uid, { stats: newRadiusStats });
  } else {
    const guestStats = JSON.parse(
      getGuestStats() || JSON.stringify(dbUserInitStats)
    );
    guestStats.stats[radius] = { ...guestStats.stats[radius], ...newStats };

    localStorage.setItem("guestStats", JSON.stringify(guestStats));
  }
};

export const updateUsername = async (
  id: string,
  username: string,
  oldUsername: string
) => {
  //~~~ Update name for a user stats in the leaderboard collection,
  //~~~ add new name in the usernames collection and delete old one
  //~~~ using transaction that never partially apply writes.
  //~~~ All writes execute at the end of a successful transaction.
  //~~~ (https://firebase.google.com/docs/firestore/manage-data/transactions)
  return await runTransaction(
    db,
    async (transaction) =>
      await transaction
        .set(doc(db, `leaderboard-stats/${id}`), { username }, { merge: true })
        .set(doc(db, `usernames/${username}`), {})
        .delete(doc(db, `usernames/${oldUsername}`))
  ).catch(() => {
    throw new Error("Failed to update data in database");
  });
};
