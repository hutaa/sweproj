import React, { useState } from "react";
import {DndContext, useDraggable, useDroppable} from "@dnd-kit/core";
import "../styles/Planner.css";

function Draggable({ id, children, onDragStart }) {
    const handleDragStart = (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
        if (onDragStart) onDragStart(id);
    };

    return (
        <div
            draggable="true"
            onDragStart={handleDragStart}
            style={{
                cursor: "grab",
                userSelect: "none",
            }}
        >
            {children}
        </div>
    );
}

function Droppable({ id, children, onDrop }) {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsOver(false);
        const draggedId = e.dataTransfer.getData("text/plain");
        if (onDrop) onDrop(draggedId, id);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                backgroundColor: isOver ? "rgba(0, 255, 0, 0.15)" : undefined,
            }}
        >
            {children}
        </div>
    );
}

function CourseNode({ course_id, course_code, course_desc, onDragStart }) {
    return (
        <Draggable id={course_id.toString()} onDragStart={onDragStart}>
            <div className="course-node-container">
                <div className="body-text">{course_code}</div>
                {course_desc && <div className="body-text">{course_desc}</div>}
            </div>
        </Draggable>
    );
}

function SemesterGroup({ semester_name, children, onDrop }) {
    return (
        <Droppable id={semester_name} onDrop={onDrop}>
            <div className="body-text">
                {semester_name}
            </div>
            <div className="course-node-group-container col-container" style={{ gap: "12px", minHeight: "60px" }}>
                {children}
            </div>
        </Droppable>
    );
}

function Planner() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState({
        "GEP": true,
        "Gateway": true,
        "Core": true,
        "Elective": true,
        "Technical Elective": true
    });

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const semesters = ["FA25", "SP26", "FA26"];
    const [courses, SetCourses] = useState([]);
    const [nextCourseId, setNextCourseId] = useState(1000);
    const [draggingFrom, setDraggingFrom] = useState(null);

    console.log(courses);

    const courseCatalog = [
        {
            category: "GEP", items: [
                { id: "ENGL100", code: "ENGL 100", placeholder: "N/A" },
                { id: "GEP-AH", code: "N/A", placeholder: "Arts and Humanities", count: 2 },
                { id: "GEP-SS", code: "N/A", placeholder: "Social Sciences", count: 3 },
                { id: "MATH151", code: "MATH 151", placeholder: "N/A" },
                { id: "MATH152", code: "MATH 152", placeholder: "N/A", prerequisites: ["MATH 151"] },
                { id: "MATH221", code: "MATH 221", placeholder: "N/A" },
                { id: "STAT355", code: "STAT 355", placeholder: "N/A" },
                { id: "GEP-SCI", code: "N/A", placeholder: "Science Sequence", count: 2 },
                { id: "GEP-LAB", code: "N/A", placeholder: "Science Lab", count: 1 },
                { id: "GEP-CULT", code: "N/A", placeholder: "Culture", count: 1 },
                { id: "GEP-LANG", code: "N/A", placeholder: "Language (Level 201+)", count: 1 }
            ]
        },
        {
            category: "Gateway", items: [
                { id: "CMSC201", code: "CMSC 201", placeholder: "N/A", prerequisites: ["MATH 151"] },
                { id: "CMSC202", code: "CMSC 202", placeholder: "N/A", prerequisites: ["CMSC 202"] },
                { id: "CMSC203", code: "CMSC 203", placeholder: "N/A", prerequisites: ["MATH 151"] }
            ]
        },
        {
            category: "Core", items: [
                { id: "CMSC304", code: "CMSC 304", placeholder: "N/A" },
                { id: "CMSC313", code: "CMSC 313", placeholder: "N/A" },
                { id: "CMSC331", code: "CMSC 331", placeholder: "N/A" },
                { id: "CMSC341", code: "CMSC 341", placeholder: "N/A" },
                { id: "CMSC447", code: "CMSC 447", placeholder: "N/A" },
                { id: "CMSC411", code: "CMSC 411", placeholder: "N/A" },
                { id: "CMSC421", code: "CMSC 421", placeholder: "N/A" },
                { id: "CMSC441", code: "CMSC 441", placeholder: "N/A" }
            ]
        },
        {
            category: "Elective", items: [
                { id: "CMSC426", code: "CMSC 426", placeholder: "N/A" },
                { id: "CMSC431", code: "CMSC 431", placeholder: "N/A" },
                { id: "CMSC435", code: "CMSC 435", placeholder: "N/A" },
                { id: "CMSC448", code: "CMSC 448", placeholder: "N/A" },
                { id: "CMSC451", code: "CMSC 451", placeholder: "N/A" },
                { id: "CMSC455", code: "CMSC 455", placeholder: "N/A" },
                { id: "CMSC456", code: "CMSC 456", placeholder: "N/A" },
                { id: "CMSC461", code: "CMSC 461", placeholder: "N/A" },
                { id: "CMSC471", code: "CMSC 471", placeholder: "N/A" },
                { id: "CMSC481", code: "CMSC 481", placeholder: "N/A" },
                { id: "CMSC483", code: "CMSC 483", placeholder: "N/A" }
            ]
        },
        {
            category: "Technical Elective", items: [
                { id: "TECH-ELEC-1", code: "N/A", placeholder: "Technical Elective", count: 3 }
            ]
        }
    ];

    const handleDragStart = (id) => {
        setDraggingFrom(id);
    };

    const handleDrop = (draggedId, targetSemester) => {
        // Check if dragging from catalog (string IDs with letters)
        const isFromCatalog = isNaN(Number(draggedId));

        if (isFromCatalog) {
            // Adding new course from catalog
            const catalogItem = courseCatalog
                .flatMap(cat => cat.items)
                .find(item => item.id === draggedId);

            if (catalogItem) {
                const newCourse = {
                    id: nextCourseId,
                    semester: targetSemester,
                    course_code: catalogItem.code !== "N/A" ? catalogItem.code : catalogItem.placeholder,
                    course_desc: "",
                    prerequisites: [catalogItem.prerequisites !== null ? catalogItem.prerequisites : null]
                };

                SetCourses(prev => [...prev, newCourse]);
                setNextCourseId(prev => prev + 1);
            }
        } else {
            // Moving existing course between semesters
            const courseId = Number(draggedId);
            SetCourses(prev =>
                prev.map(course =>
                    course.id === courseId ? { ...course, semester: targetSemester } : course
                )
            );
        }

        setDraggingFrom(null);
    };

    const handleSidebarDrop = (draggedId) => {
        // Only remove courses (numeric IDs), not catalog items
        const isFromCatalog = isNaN(Number(draggedId));
        
        if (!isFromCatalog) {
            // Remove the course from the plan
            const courseId = Number(draggedId);
            SetCourses(prev => prev.filter(course => course.id !== courseId));
        }
        
        setDraggingFrom(null);
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

    function handleDragEnd(event)
    {
        const {over} = event;

        // Checks if the object was dropped over a container.
        if (over)
        {
            // Only allow the object to be dropped into the semester if its prerequisites were satisfied and if the object doesn't invalidate dependent courses.
            if (CheckPrerequisitesMet(draggingFrom.id, over.id) === true && CheckPrerequisitesMaintained(draggingFrom.id, over.id))
            {
                SetCourses([...courses, courses[draggingFrom.id].semester = over.id]);
            }
        }
        // Handles the case for dropping the object over nothing.
        else
        {
            // Checks if the object doesn't invalidate dependent courses.
            if (CheckPrerequisitesMaintained(draggingFrom.id, null) === true)
            {
                SetCourses([...courses, courses[draggingFrom.id].semester = null]);
            }
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
            <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? '◀' : '▶'}
                </button>
                {sidebarOpen && (
                    <Droppable id="sidebar" onDrop={handleSidebarDrop}>
                        <div className="sidebar-content">
                            {courseCatalog.map((categoryGroup) => (
                                <div key={categoryGroup.category} className="category-section">
                                    <div
                                        className="category-header"
                                        onClick={() => toggleCategory(categoryGroup.category)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span>{expandedCategories[categoryGroup.category] ? '▼' : '▶'}</span>
                                        <span style={{ marginLeft: '8px' }}>{categoryGroup.category}</span>
                                    </div>
                                    {expandedCategories[categoryGroup.category] && categoryGroup.items.map((item) => (
                                        <Draggable key={item.id} id={item.id} onDragStart={handleDragStart}>
                                            <div className="catalog-item">
                                                {item.code !== "N/A" ? item.code : item.placeholder}
                                                {item.count && ` (${item.count})`}
                                            </div>
                                        </Draggable>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </Droppable>
                )}
            </div>

            <div className="page-container">
                <button className="nav-btn" onClick={() => window.location.href = '/'}>
                    ← Back to Page 1
                </button>

                <div className="medium-text">
                    Course Plan
                </div>

                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="row-container">
                        {semesters.map((semester) => (
                            <div key={semester}>
                                <SemesterGroup semester_name={semester} onDrop={handleDrop}>
                                    {courses
                                        .filter((course) => course && course.semester === semester)
                                        .map((course) => (
                                            <CourseNode
                                                key={course.id}
                                                course_id={course.id}
                                                course_code={course.course_code}
                                                course_desc={course.course_desc}
                                                onDragStart={handleDragStart}
                                            />
                                        ))}
                                </SemesterGroup>
                            </div>
                        ))}
                    </div>
                </DndContext>
            </div>
        </div>
    );
}

export default Planner;