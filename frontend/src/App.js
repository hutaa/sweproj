import { useEffect, useState } from "react";
import { getCourses, getPrograms } from "./services/api"; // Import from services folder

function App() {
  const [message, setMessage] = useState("");
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    // Test basic connection
    fetch("http://localhost:5000/api/test")
      .then(res => res.json())
      .then(data => setMessage(data.message));

    // Test your API functions
    getCourses().then(coursesData => {
      console.log("Courses loaded:", coursesData);
      setCourses(coursesData);
    });

    getPrograms().then(programsData => {
      console.log("Programs loaded:", programsData);
      setPrograms(programsData);
    });
  }, []);

  return (
    <div>
      <h1>Pre-Transfer Advising</h1>
      <p>{message}</p>
      
      <h2>Courses ({courses.length})</h2>
      <ul>
        {courses.map(course => (
          <li key={course._id}>{course.course_code}: {course.course_name}</li>
        ))}
      </ul>

      <h2>Programs ({programs.length})</h2>
      <ul>
        {programs.map(program => (
          <li key={program._id}>{program.program_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;