import React, {useState, useEffect} from "react";
import {DndContext, useDraggable, useDroppable} from '@dnd-kit/core';

import "../styles/PlannerPrototype.css"

function Draggable(props) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: props.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
  
    return (
        <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {props.children}
        </button>
    );
}

function Droppable(props) {
    const {isOver, setNodeRef} = useDroppable({
        id: props.id,
    });

    const style = {
        backgroundColor: isOver ? "rgba(0, 255, 0, 0.35)" : undefined,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {props.children}
        </div>
    );
}

function CourseNode({course_id, course_code, course_desc})
{
    return (
        <Draggable className="course-node-container" id={course_id}>
            <div className="body-text">
                {course_code}
            </div>
            <div className="body-text">
                {course_desc}
            </div>
        </Draggable>
    );
}

function SemesterGroup({semester_name, children})
{
    return (
        <Droppable id={semester_name}>
            <div className="body-text">
                {semester_name}
            </div>
            <div className="course-node-group-container col-container" style={{gap: "12px", minHeight: "60px"}}>
                {children}
            </div>
        </Droppable>
    )
}

function PlannerPrototype()
{
    const semesters = ["FA25", "SP26", "FA26"];
    const [courses, SetCourses] = useState([
        {id: 0, semester: null, course_code: "TEST 123", course_desc: "Introduction to Testing 1", prerequisites: []},
        {id: 1, semester: null, course_code: "TEST 234", course_desc: "Introduction to Testing 2", prerequisites: ["TEST 123"]},
        {id: 2, semester: null, course_code: "TEST 345", course_desc: "Introduction to Testing 3", prerequisites: ["TEST 123", "TEST 234"]},
    ]);

    const [dragging, SetDragging] = useState();

    const [valid_semesters, SetValidSemesters] = useState(); //Used for keeping track of valid placements for the current course being dragged.

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
        if (semester)
        {
            var temp = String(semester);
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
        }
        
        // Return invalid semesters as 0.
        return 0;
    }

    function CheckPrerequisitesMet(entry_id, proposed_semester)
    {
        var remaining_prerequisites = [];

        //Populates remaining_prerequisites as a deep copy of the prerequisites.
        for (let i = 0; i < courses[entry_id]["prerequisites"].length; i++)
        {
            remaining_prerequisites.push(courses[entry_id]["prerequisites"][i]);
        }

        var proposed_semester_val = SemesterToInt(proposed_semester);

        //console.log("Prerequisites Check Starting, checking for " + remaining_prerequisites.length + " prerequisites.");

        if (remaining_prerequisites.length > 0)
        {
            // Loop through all courses, checking whether they satisfy a prerequisite requirement.
            for (let i = 0; i < courses.length; i++)
            {
                // Validates that the semester is non-null.
                if (i !== entry_id && courses[i] && courses[i].semester)
                {
                    /*
                    console.log("New Iteration for " + courses[i]["course_code"]);
                    console.log((SemesterToInt(courses[i].semester) < proposed_semester_val) + ", " + (remaining_prerequisites.includes(courses[i]["course_code"]) === true));
                    for (let v = 0; v < remaining_prerequisites.length; v++)
                    {
                        console.log(remaining_prerequisites[v]);
                    }
                    */

                    // Checks if it's found in the prerequisites list and if the specific course is included in an earlier semester.
                    if ((SemesterToInt(courses[i].semester) < proposed_semester_val) && (remaining_prerequisites.includes(courses[i]["course_code"]) === true))
                    {
                        // Removes the element from the list of remaining prerequisites.
                        remaining_prerequisites.splice(remaining_prerequisites.findIndex((element) => element === courses[i]["course_code"]), 1);
                        
                        if (remaining_prerequisites.length === 0)
                        {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        return true;
    };

    function CheckPrerequisitesMaintained(entry_id, proposed_semester)
    {
        var course_dependency = courses[entry_id];
        var proposed_semester_val = SemesterToInt(proposed_semester);

        console.log(proposed_semester_val);

        for (let i = 0; i < courses.length; i++)
        {
            // Conduct initial validation checks.
            if (i !== entry_id && courses[i] && courses[i]["semester"] && courses[i]["prerequisites"].length > 0)
            {
                // Checks if the course dependency is found in the prerequisites list of the current course being scanned.
                if ((courses[i]["prerequisites"].includes(course_dependency["course_code"]) === true))
                {
                    // Checks if the newly proposed semester satisfies prerequisite requirements for the current course being scanned.
                    if (0 < proposed_semester_val && proposed_semester_val < SemesterToInt(courses[i].semester))
                    {
                        // No further action is needed.
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    function handleDragStart(event)
    {
        SetDragging(event.active);
    };

    function handleDragOver(event)
    {
        const {over} = event;

    };

    function handleDragEnd(event)
    {
        const {over} = event;

        // Checks if the object was dropped over a container.
        if (over)
        {
            // Only allow the object to be dropped into the semester if its prerequisites were satisfied and if the object doesn't invalidate dependent courses.
            if (CheckPrerequisitesMet(dragging.id, over.id) === true && CheckPrerequisitesMaintained(dragging.id, over.id))
            {
                SetCourses([...courses, courses[dragging.id].semester = over.id]);
            }
        }
        // Handles the case for dropping the object over nothing.
        else
        {
            // Checks if the object doesn't invalidate dependent courses.
            if (CheckPrerequisitesMaintained(dragging.id, null) === true)
            {
                SetCourses([...courses, courses[dragging.id].semester = null]);
            }
        }
    };

    return (
        <div className="page-container">
            <div className="medium-text text-align-left">
                {"Course Plan"}
            </div>

            <div style={{height: "12px"}} />

            <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                <div className="row-container" style={{gap: "12px"}}>
                    <div className="course-node-group-container col-container" style={{gap: "12px"}}>
                        {
                            courses.filter((course) => (course && course.semester === null)).map((course) => (
                                <div key={course.id}>
                                    <CourseNode key={course.id} course_id={course.id} course_code={course.course_code} course_desc={course.course_desc} />
                                </div>
                            ))
                        }
                    </div>
                    {
                        semesters.map((semester) => (
                            <div key={semester}>
                                <SemesterGroup key={semester} semester_name={semester}>
                                    {
                                        courses.filter((course) => (course && course.semester === semester)).map((course) => (
                                            <div key={course.id}>
                                                <CourseNode key={course.id} course_id={course.id} course_code={course.course_code} course_desc={course.course_desc} />
                                            </div>
                                        ))
                                    }
                                </SemesterGroup>
                            </div>
                        ))
                    }
                </div>
            </DndContext>
        </div>
    )
}

export default PlannerPrototype;