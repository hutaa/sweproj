import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TransferCoursesPage.css";

function TransferCoursesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    { id: 1, semester: "", course: "", equivalent: "" }
  ]);
  const [nextId, setNextId] = useState(2);

  const addRow = () => {
    setRows([...rows, { id: nextId, semester: "", course: "", equivalent: "" }]);
    setNextId(nextId + 1);
  };

  const deleteRow = (id) => {
    const rowToDelete = rows.find(r => r.id === id);
    const isRowEmpty = !rowToDelete.semester && !rowToDelete.course && !rowToDelete.equivalent;

    // If only one row exists, clear it instead of deleting
    if (rows.length === 1) {
      setRows([{ id: rows[0].id, semester: "", course: "", equivalent: "" }]);
      return;
    }

    // If row is empty, delete immediately
    if (isRowEmpty) {
      setRows(rows.filter(r => r.id !== id));
      return;
    }

    // If row has content, ask for confirmation
    if (window.confirm("This row has content. Are you sure you want to delete it?")) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  return (
    <div className="transfer-courses-container">
      <h1 className="transfer-courses-title">Transfer Courses</h1>
      
      <div className="table-wrapper">
        <table className="transfer-table">
          <thead>
            <tr>
              <th>Semester Taken</th>
              <th>Course</th>
              <th>UMBC Course Equivalent</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="text"
                    value={row.semester}
                    onChange={(e) => updateRow(row.id, "semester", e.target.value)}
                    placeholder="e.g., Fall 2023"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.course}
                    onChange={(e) => updateRow(row.id, "course", e.target.value)}
                    placeholder="e.g., ENGL 101"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.equivalent}
                    onChange={(e) => updateRow(row.id, "equivalent", e.target.value)}
                    placeholder="e.g., ENGL 100"
                    className="table-input"
                  />
                </td>
                <td className="actions-cell">
                  <button
                    onClick={addRow}
                    className="btn btn-add"
                    title="Add row"
                  >
                    +
                  </button>
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="btn btn-delete"
                    title="Delete row"
                  >
                    −
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="navigation-container">
        <button
          onClick={() => navigate("/planner")}
          className="btn-navigate"
        >
          Go to Planner Page ➡
        </button>
      </div>
    </div>
  );
}

export default TransferCoursesPage;