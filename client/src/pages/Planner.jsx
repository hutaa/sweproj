import React, {useState} from "react";
import "../styles/Planner.css"

function CourseNode({course_code, course_desc})
{
    return (
        <div className="course-node-container">
            <div className="body-text">
                {course_code}
            </div>
            <div className="body-text">
                {course_desc}
            </div>
        </div>
    );
}

function Semestersemester({semester_name, children})
{
    return (
        <div>
            <div className="body-text">
                {semester_name}
            </div>
            <div className="course-node-semester-container col-container" style={{gap: "12px"}}>
                {children}
            </div>
        </div>
    )
}

function Planner()
{
    const semesters = ["FA25", "SP26", "FA26"];
    const [courses, setcourses] = useState([
        { id: 1, semester: "FA25", course_code: "TEST 123", course_desc: "Introduction to Testing 1"},
        { id: 2, semester: "SP26", course_code: "TEST 234", course_desc: "Introduction to Testing 2"},
        { id: 3, semester: "FA26", course_code: "TEST 345", course_desc: "Introduction to Testing 3"},
    ]);

    const [dragging, setDragging] = useState();

    const handleDragStart = (e) =>
    {
        setDragging(e.target);
    };

    const onDragEnter = (e, semester) =>
    {
        setcourses([...courses, (courses[dragging.id -1].semester = semester)]);
    };

    return (
        <div className="page-container">
            <div className="medium-text text-align-left">
                {"Course Plan"}
            </div>

            <div style={{height: "12px"}} />

            <div className="row-container" style={{gap: "12px"}}>
                {
                    semesters.map((semester) => (
                        <div key={semester} onDragEnter={(e) => onDragEnter(e, semester)}>
                            <Semestersemester semester_name={semester} key={semester} onDragEnter={(e) => onDragEnter(e, semester)}>
                                {
                                    courses.filter((item) => item.semester === semester).map((course) => (
                                        <div key={course.id} id={course.id} draggable onDragStart={(e) => handleDragStart(e)}>
                                            <CourseNode course_code={course.course_code} course_desc={course.course_desc} />
                                        </div>
                                    ))
                                }
                            </Semestersemester>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Planner;