import { useNavigate } from "react-router-dom";

const IndexPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>IndexPage</h1>
      <button
        onClick={() => {
          navigate("folder/test/test.md");
        }}
      >
        機能テストページへ
      </button>
    </div>
  );
};

export default IndexPage;
