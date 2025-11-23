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
        {id: 0, semester: null, course_code: "TEST 123", course_desc: "Testing 1", prerequisites: []},
        {id: 1, semester: null, course_code: "TEST 234", course_desc: "Testing 2", prerequisites: [{type: "AND", courses:["TEST 123"]}]},
        {id: 2, semester: null, course_code: "TEST 234H", course_desc: "Testing 2H", prerequisites: [{type: "AND", courses:["TEST 123"]}]},
        {id: 3, semester: null, course_code: "TEST 345", course_desc: "Testing 3", prerequisites: [{type: "OR", courses: ["TEST 234", "TEST 234H"]}]},
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

        /*
            CNF Format (AND of OR Clauses)
            [
                [ENTRY1]
                [ENTRY2]
                [ENTRY3, ENTRY4, ENTRY5]
            ]
            Equal to ENTRY1 AND ENTRY2 AND (ENTRY3 OR ENTRY4 OR ENTRY5)
        */

        // Populates remaining_prerequisites as a deep copy of the prerequisites.
        for (let i = 0; i < courses[entry_id]["prerequisites"].length; i++)
        {
            // Verify that the dictionary nested within the array is formatted correctly.
            if (courses[entry_id]["prerequisites"][i]["type"] && courses[entry_id]["prerequisites"][i]["courses"])
            {
                if (courses[entry_id]["prerequisites"][i]["type"] === "AND")
                {
                    for (let v = 0; v < courses[entry_id]["prerequisites"][i]["courses"].length; v++)
                    {
                        remaining_prerequisites.push([courses[entry_id]["prerequisites"][i]["courses"][v]]);
                    }
                }
                else //if (courses[entry_id]["prerequisites"][i]["type"] === "OR")
                {
                    var clause = [];
                    for (let v = 0; v < courses[entry_id]["prerequisites"][i]["courses"].length; v++)
                    {
                        clause.push(courses[entry_id]["prerequisites"][i]["courses"][v]);
                    }
                    remaining_prerequisites.push(clause);
                }
            }
        }

        var proposed_semester_val = SemesterToInt(proposed_semester);

        //console.log("Prerequisites Check Starting, checking for " + remaining_prerequisites.length + " prerequisites.");

        if (remaining_prerequisites.length > 0)
        {
            // Loop through all courses, checking whether they satisfy a prerequisite requirement.
            for (let i = 0; i < courses.length; i++)
            {
                // Validates that the semester is non-null and if the specific course is included in an earlier semester
                if (i !== entry_id && courses[i] && courses[i].semester && (SemesterToInt(courses[i].semester) < proposed_semester_val))
                {
                    // Loop through all prerequisites clauses.
                    for (let v = 0; v < remaining_prerequisites.length; v++)
                    {
                        // Checks if the specific course is found in the prerequisites clause list.
                        if (remaining_prerequisites[v] && remaining_prerequisites[v].includes(courses[i]["course_code"]) === true)
                        {
                            // Removes the clause from the list of remaining prerequisites.
                            remaining_prerequisites.splice(v, 1);

                            // Queue another check at the current index again. 
                            v -= 1;
                            
                            if (remaining_prerequisites.length === 0)
                            {
                                return true;
                            }
                        }
                    }
                }
            }
            
            // Prerequisites have not been satisfied.

            var return_msg = "Missing ";
            for (let i = 0; i < remaining_prerequisites.length; i++)
            {
                if (i > 0)
                {
                    return_msg += ", (";
                }
                else
                {
                    return_msg += "(";
                }

                for (let v = 0; v < remaining_prerequisites[i].length; v++)
                {
                    if (v > 0)
                    {
                        return_msg += " or ";
                    }
                    return_msg += remaining_prerequisites[i][v];
                }

                return_msg += ")";
            }

            console.log(return_msg);

            return false;
        }

        return true;
    };

    function CheckPrerequisitesMaintained(entry_id, proposed_semester)
    {
        var dragged_course = courses[entry_id];
        var proposed_semester_val = SemesterToInt(proposed_semester);
        var dependents = [];

        //console.log(proposed_semester_val);

        for (let i = 0; i < courses.length; i++)
        {
            // Conduct initial validation checks.
            if (i !== entry_id && courses[i] && courses[i]["semester"] && courses[i]["prerequisites"] && courses[i]["prerequisites"].length > 0)
            {
                for (let v = 0; v < courses[i]["prerequisites"].length; v++)
                {
                    // For AND clause, checks if the dragged course is found in the prerequisites list of the current course being scanned.
                    if (courses[i]["prerequisites"][v]["type"] === "AND" && courses[i]["prerequisites"][v]["courses"].includes(dragged_course["course_code"]) === true)
                    {
                        // Checks if the newly proposed semester does not satisfy prerequisite requirements for the current course being scanned.
                        if ((0 < proposed_semester_val && proposed_semester_val < SemesterToInt(courses[i].semester)) === false)
                        {
                            var return_msg = courses[i]["course_code"] + " is dependent on " + dragged_course["course_code"];

                            console.log(return_msg);

                            return false;
                        }
                    }

                    // For OR clause, checks if the dragged course is found in the prerequisites list of the current course being scanned.
                    if (courses[i]["prerequisites"][v]["type"] === "OR" && courses[i]["prerequisites"][v]["courses"].includes(dragged_course["course_code"]) === true)
                    {
                        // Two Cases: Dragged course is the sole dependency in the clause, or dragged course isn't needed to fulfill the dependency.
                        
                        var clause_satisfied = false; // Only evaluates to true when the OR clause can be satisfied by a course.

                        for (let c = 0; c < courses[i]["prerequisites"][v]["courses"].length; c++)
                        {
                            //console.log(courses[i]["prerequisites"][v]["courses"][c] === dragged_course["course_code"]);

                            // Checks if the current prerequisite course is also the dragged course.
                            if (courses[i]["prerequisites"][v]["courses"][c] === dragged_course["course_code"])
                            {
                                // Checks if the newly proposed semester satisfies prerequisite requirements for the current course being scanned.
                                if ((0 < proposed_semester_val && proposed_semester_val < SemesterToInt(courses[i].semester)) === true)
                                {
                                    clause_satisfied = true;
                                    break;
                                }
                            }
                            else
                            {
                                // Searches for the potentially active prerequisite.
                                var foundIndex = courses.findIndex((element) => element["course_code"] === courses[i]["prerequisites"][v]["courses"][c]);
                                
                                // Checks that the prerequisite course can satisfy the current course being scanned.
                                if (foundIndex !== -1 && 0 < SemesterToInt(courses[foundIndex].semester) && SemesterToInt(courses[foundIndex].semester) < SemesterToInt(courses[i].semester))
                                {
                                    clause_satisfied = true;
                                    break;
                                }
                            }
                        }

                        if (courses[i]["prerequisites"][v]["courses"].length > 0 && clause_satisfied === false)
                        {
                            var return_msg = courses[i]["course_code"] + " Requires Prerequisite " + dragged_course["course_code"];

                            console.log(return_msg);

                            return false;
                        }
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