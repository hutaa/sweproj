import React, {useState, useEffect} from "react";
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

function SemesterGroup({semester_name, children})
{
    return (
        <div>
            <div className="body-text">
                {semester_name}
            </div>
            <div className="course-node-group-container col-container" style={{gap: "12px"}}>
                {children}
            </div>
        </div>
    )
}

function Planner()
{
    const semesters = ["FA25", "SP26", "FA26"];
    const [courses, SetCourses] = useState([
        {id: 0, semester: "FA25", course_code: "TEST 123", course_desc: "Introduction to Testing 1", prerequisites: []},
        {id: 1, semester: "SP26", course_code: "TEST 234", course_desc: "Introduction to Testing 2", prerequisites: ["TEST 123"]},
        {id: 2, semester: "FA26", course_code: "TEST 345", course_desc: "Introduction to Testing 3", prerequisites: ["TEST 123", "TEST 234"]},
    ]);

    const [dragging, SetDragging] = useState();

    const [valid_semesters, SetValidSemesters] = useState(); //Used for keeping track of valid placements for the current course being dragged.

    const handleDragStart = (e, id) =>
    {
        SetDragging(e.target);

        var temp = [];
        for (let i = 0; i < semesters.length; i++)
        {
            if (CheckPrerequisitesMet(id, SemesterToInt(semesters[i])) === true)
            {
                temp.push(semesters[i]);
            }
        }
        SetValidSemesters(temp);
    };

    const onDragEnter = (e, semester) =>
    {
        if (valid_semesters.includes(semester) === true)
        {
            SetCourses([...courses, (courses[dragging.id].semester = semester)]);
        }
    };

    /*

    Parsing Semesters as Integers:
        20261 for WI2026
        20262 for SP2026
        20263 for SU2026
        20264 for FA2026

    Alternative Scheme:
        261 for WI2026
        262 for SP2026
        263 for SU2026
        264 for FA2026

    Format:
        First 2 or 4 Digits for Year
        Last Digit for Season
    
    Numeric sorting results in chronological order.

    */

    function SemesterToInt(semester)
    {
        var temp = semester;
        temp = temp.substring(0, 2);

        // Compute last digit of the number.
        if (temp === "WI")
        {
            temp = 1;
        }
        else if (temp === "SP")
        {
            temp = 2;
        }
        else if (temp === "SU")
        {
            temp = 3;
        }
        else if (temp === "FA")
        {
            temp = 4;
        }
        
        // Checks if a valid substring was read.
        if (Number.isInteger(temp) === true)
        {
            return parseInt(semester.substring(2, 6)) * 10 + temp;
        }
        
        // Return invalid semesters as 0.
        return 0;
    }

    useEffect(() => {

        var temp;

        // Loop through all courses, and generate numeric representations of semesters.
        for (let i = 0; i < courses.length; i++)
        {
            temp = courses[i].semester;

            // Verifies that a valid semester value was retrieved.
            if (temp)
            {
                courses[i]["semester_val"] = SemesterToInt(temp);

                // console.log(courses[i]["semester_val"]);
            }
        }

    }, [courses]);

    function CheckPrerequisitesMet(entry_id, proposed_semester_val)
    {
        var remaining_prerequisites = courses[entry_id]["prerequisites"];
        
        console.log("Prerequisites Check Starting, checking for " + remaining_prerequisites.length + " prerequisites.");

        if (remaining_prerequisites.length > 0)
        {
            // Loop through all courses, checking whether they satisfy a prerequisite requirement.
            for (let i = 0; i < courses.length; i++)
            {
                console.log((courses[i]["semester_val"] < proposed_semester_val) + ", " + (remaining_prerequisites.includes(courses[i]["course_code"]) === true));

                // Checks if it's found in the prerequisites list and if the specific course is included in an earlier semester.
                if ((courses[i]["semester_val"] < proposed_semester_val) && (remaining_prerequisites.includes(courses[i]["course_code"]) === true))
                {
                    // Removes the element from the list of remaining prerequisites.
                    remaining_prerequisites.splice(remaining_prerequisites.findIndex(element => element.course_code === courses[i]["course_code"]), 1);
                    
                    if (remaining_prerequisites === 0)
                    {
                        return true;
                    }
                }
            }

            return false;
        }

        return true;
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
                            <SemesterGroup semester_name={semester} key={semester} onDragEnter={(e) => onDragEnter(e, semester)}>
                                {
                                    courses.filter((item) => item.semester === semester).map((course) => (
                                        <div key={course.id} id={course.id} draggable onDragStart={(e) => handleDragStart(e, course.id)}>
                                            <CourseNode course_code={course.course_code} course_desc={course.course_desc} />
                                        </div>
                                    ))
                                }
                            </SemesterGroup>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Planner;