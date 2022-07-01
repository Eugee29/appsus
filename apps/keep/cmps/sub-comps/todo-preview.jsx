export function TodoPreview({ keep }) {
  return (
    <React.Fragment>
        {keep.title ? <h1>{keep.title}</h1> : ""}
      <ul className="keep-todos">
        {keep.content.split(",").map((todo, idx) => {
          return (
            <li key={idx} className="todo-line">
              <input type="checkbox" id={keep.id + idx} />
              <label htmlFor={keep.id + idx}>
                {todo.charAt(0) === " " ? todo.substring(1) : todo}
              </label>
            </li>
          );
        })}
      </ul>
    </React.Fragment>
  );
}
