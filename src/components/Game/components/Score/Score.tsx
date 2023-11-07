import "./Score.scss";

type Props = {
  title: string;
  val: number;
};

function Score({ title, val }: Props) {
  return (
    <div className="score">
      <span className="score-title">{title}</span>

      <span className="score-value">{val.toLocaleString()}</span>
    </div>
  );
}

export default Score;
