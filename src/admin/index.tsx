import { useState } from "react";
import { Button } from "antd";

function AdminEntry() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Admin</h1>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)} />
    </>
  );
}

export default AdminEntry;
