import { ColorRing } from "react-loader-spinner";

type Props = {
  size: string;
};

function RingLoader({ size }: Props) {
  return (
    <ColorRing
      visible={true}
      height={size}
      width={size}
      ariaLabel="blocks-loading"
      wrapperClass="blocks-wrapper"
      colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
    />
  );
}

export default RingLoader;
