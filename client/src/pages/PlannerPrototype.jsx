import React, {useState, useEffect} from "react";
import {DndContext, useDraggable, useDroppable} from '@dnd-kit/core';
import { useSearchParams } from "react-router-dom";

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import '../styles/PlannerPrototype.css';

// Draggable Component
function Draggable(props) {
    const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
        id: props.id,
    });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
        //position: isDragging ? "fixed" : undefined,
        //width: isDragging ? "inherit" : undefined,
    };
  
    return (
        <button ref={setNodeRef} style={style} {...listeners} {...attributes} className={props.className}>
            {props.children}
        </button>
    );
}

// Droppable Component
function Droppable(props) {
    const {isOver, setNodeRef} = useDroppable({
        id: props.id,
    });

    const style = {
        backgroundColor: isOver ? "rgba(253, 181, 21, 0.2)" : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className={props.className}>
            {props.children}
        </div>
    );
}

// Course Node Component
function CourseNode({course_id, course_code, course_desc}) {
    return (
        <Draggable className="course-node" id={course_id}>
            <div className="course-code">{course_code}</div>
        </Draggable>
    );
}

// Semester Group Component
function SemesterGroup({semester_name, children}) {
    return (
        <Droppable id={semester_name} className="semester-column">
            <div className="semester-header">{semester_name}</div>
            <div className="semester-content">
                {children}
            </div>
        </Droppable>
    );
}

// Sidebar Category Component
function SidebarCategory({title, courses, isExpanded, onToggle}) {
    return (
        <div className="sidebar-category">
            <button className="category-header" onClick={onToggle}>
                <span className="category-arrow">{isExpanded ? '▼' : '▶'}</span>
                <span className="category-title">{title}</span>
            </button>
            {isExpanded && (
                <div className="category-courses">
                    {courses.map((course) => (
                        <div key={course.id} className="sidebar-course-wrapper">
                            <CourseNode 
                                course_id={course.id} 
                                course_code={course.course_code} 
                                course_desc={course.course_desc} 
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PlannerPrototype() {
    const semesters = ["FA2025", "SP2026", "FA2026", "SP2027", "FA2027", "SP2028", "FA2028", "SP2029"];
    const [courses, SetCourses] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState({
        'GEP': false,
        'Gateway': true,
        'Core': true,
        'Elective': false
    });

    const [alert_warning_text, SetAlertWarningText] = useState("");
    const [alert_error_text, SetAlertErrorText] = useState("");

    // Categorize courses based on course codes
    const categorizeCourses = (coursesList) => {
        const categories = {
            'GEP': [],
            'Gateway': [],
            'Core': [],
            'Elective': []
        };

        const gatewayCourses = ['CMSC 201', 'CMSC 202', 'CMSC 203'];
        const coreCourses = ['CMSC 304', 'CMSC 313', 'CMSC 331', 'CMSC 341', 'CMSC 447', 'CMSC 411', 'CMSC 421', 'CMSC 441'];
        const electiveCourses = ['CMSC 426', 'CMSC 431', 'CMSC 435'];

        coursesList.forEach(course => {
            // Check if course exists and has required properties
            if (course && course.course_code && !course.semester) {
                const code = course.course_code;
                
                if (gatewayCourses.includes(code)) {
                    categories['Gateway'].push(course);
                } else if (coreCourses.includes(code)) {
                    categories['Core'].push(course);
                } else if (electiveCourses.includes(code)) {
                    categories['Elective'].push(course);
                } else {
                    categories['GEP'].push(course);
                }
            }
        });

        return categories;
    };

    async function loadCourses() {
        try {
            const res = await fetch("http://localhost:5000/api/courses");
            const data = await res.json();

            const formatted = data.map((c, index) => {
                var prereqList = [];

                if (Array.isArray(c.prerequisites)) {
                    for (const p of c.prerequisites) {
                        if (p.type === "AND" && Array.isArray(p.courses)) {
                            prereqList.push({type: p.type, courses: p.courses});
                        }
                        else if (p.type === "OR" && Array.isArray(p.courses)) {
                            prereqList.push({type: p.type, courses: p.courses});
                        }
                        if (p.type === "SINGLE" && Array.isArray(p.courses)) {
                            prereqList.push({type: "AND", courses: p.courses});
                        }
                    }
                }

                return {
                    id: index,
                    semester: null,
                    credits: c.credit,
                    course_code: c.course_code,
                    course_desc: c.course_name,
                    prerequisites: prereqList
                };
            });
            SetCourses(formatted);
        } catch (err) {
            console.error("Error loading courses:", err);
        }
    }
    
    const [dragging, SetDragging] = useState();
    const [searchParams, SetSearchParams] = useSearchParams();

    useEffect(() => {
        const courses_string = searchParams.get("data");
        if (courses_string) {
            SetCourses(JSON.parse(decodeURIComponent(courses_string)));
        } else {
            loadCourses();
        }
    }, [searchParams]);

    function SemesterToInt(semester) {
        if (semester) {
            var temp = String(semester);
            temp = temp.substring(0, 2);

            if (temp === "WI") {
                temp = 1;
            } else if (temp === "SP") {
                temp = 2;
            } else if (temp === "SU") {
                temp = 3;
            } else if (temp === "FA") {
                temp = 4;
            }
            
            if (Number.isInteger(temp) === true) {
                return parseInt(semester.substring(2, 6)) * 10 + temp;
            }
        }
        return 0;
    }

    function CheckPrerequisitesMet(entry_id, proposed_semester) {
        var remaining_prerequisites = [];

        for (let i = 0; i < courses[entry_id]["prerequisites"].length; i++) {
            if (courses[entry_id]["prerequisites"][i]["type"] && courses[entry_id]["prerequisites"][i]["courses"]) {
                if (courses[entry_id]["prerequisites"][i]["type"] === "AND") {
                    for (let v = 0; v < courses[entry_id]["prerequisites"][i]["courses"].length; v++) {
                        remaining_prerequisites.push([courses[entry_id]["prerequisites"][i]["courses"][v]]);
                    }
                } else {
                    var clause = [];
                    for (let v = 0; v < courses[entry_id]["prerequisites"][i]["courses"].length; v++) {
                        clause.push(courses[entry_id]["prerequisites"][i]["courses"][v]);
                    }
                    remaining_prerequisites.push(clause);
                }
            }
        }

        var proposed_semester_val = SemesterToInt(proposed_semester);

        if (remaining_prerequisites.length > 0) {
            for (let i = 0; i < courses.length; i++) {
                if (i !== entry_id && courses[i] && courses[i].semester && (SemesterToInt(courses[i].semester) < proposed_semester_val)) {
                    for (let v = 0; v < remaining_prerequisites.length; v++) {
                        if (remaining_prerequisites[v] && remaining_prerequisites[v].includes(courses[i]["course_code"]) === true) {
                            remaining_prerequisites.splice(v, 1);
                            v -= 1;
                            
                            if (remaining_prerequisites.length === 0) {
                                return true;
                            }
                        }
                    }
                }
            }
            
            var return_msg = "Missing ";
            for (let i = 0; i < remaining_prerequisites.length; i++) {
                if (i > 0) {
                    return_msg += ", (";
                } else {
                    return_msg += "(";
                }

                for (let v = 0; v < remaining_prerequisites[i].length; v++) {
                    if (v > 0) {
                        return_msg += " or ";
                    }
                    return_msg += remaining_prerequisites[i][v];
                }
                return_msg += ")";
            }

            console.log(return_msg);
            SetAlertWarningText(return_msg);
            return false;
        }

        return true;
    }

    function CheckPrerequisitesMaintained(entry_id, proposed_semester) {
        var dragged_course = courses[entry_id];
        var proposed_semester_val = SemesterToInt(proposed_semester);

        for (let i = 0; i < courses.length; i++) {
            if (i !== entry_id && courses[i] && courses[i]["semester"] && courses[i]["prerequisites"] && courses[i]["prerequisites"].length > 0) {
                for (let v = 0; v < courses[i]["prerequisites"].length; v++) {
                    if (courses[i]["prerequisites"][v]["type"] === "AND" && courses[i]["prerequisites"][v]["courses"].includes(dragged_course["course_code"]) === true) {
                        if ((0 < proposed_semester_val && proposed_semester_val < SemesterToInt(courses[i].semester)) === false) {
                            var return_msg = courses[i]["course_code"] + " is dependent on " + dragged_course["course_code"];
                            console.log(return_msg);
                            return false;
                        }
                    }

                    if (courses[i]["prerequisites"][v]["type"] === "OR" && courses[i]["prerequisites"][v]["courses"].includes(dragged_course["course_code"]) === true) {
                        var clause_satisfied = false;

                        for (let c = 0; c < courses[i]["prerequisites"][v]["courses"].length; c++) {
                            if (courses[i]["prerequisites"][v]["courses"][c] === dragged_course["course_code"]) {
                                if ((0 < proposed_semester_val && proposed_semester_val < SemesterToInt(courses[i].semester)) === true) {
                                    clause_satisfied = true;
                                    break;
                                }
                            } else {
                                var foundIndex = courses.findIndex((element) => element["course_code"] === courses[i]["prerequisites"][v]["courses"][c]);
                                
                                if (foundIndex !== -1 && 0 < SemesterToInt(courses[foundIndex].semester) && SemesterToInt(courses[foundIndex].semester) < SemesterToInt(courses[i].semester)) {
                                    clause_satisfied = true;
                                    break;
                                }
                            }
                        }

                        if (courses[i]["prerequisites"][v]["courses"].length > 0 && clause_satisfied === false) {
                            var return_msg = courses[i]["course_code"] + " Requires Prerequisite " + dragged_course["course_code"];
                            console.log(return_msg);
                            SetAlertWarningText(return_msg);
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    function handleDragStart(event) {
        SetDragging(event.active);
    }

    function handleDragOver(event) {
        const {over} = event;
        //SetAlertWarningText("");
        //SetAlertErrorText("");
    }

    function handleDragEnd(event) {
        const {over} = event;

        if (over) {
            if (CheckPrerequisitesMet(dragging.id, over.id) === true && CheckPrerequisitesMaintained(dragging.id, over.id)) {
                const updatedCourses = [...courses];
                updatedCourses[dragging.id] = {...updatedCourses[dragging.id], semester: over.id};
                SetCourses(updatedCourses);
            }
        } else {
            if (CheckPrerequisitesMaintained(dragging.id, null) === true) {
                const updatedCourses = [...courses];
                updatedCourses[dragging.id] = {...updatedCourses[dragging.id], semester: null};
                SetCourses(updatedCourses);
            }
        }
    }

    function handleReset() {
        const url = "/planner-prototype";
        window.location.replace(url);
    }

    function handleSave() {
        const courses_string = encodeURIComponent(JSON.stringify(courses));
        const url = "/planner-prototype?data=" + courses_string;
        window.location.replace(url);
    }

    function handleExport() {
        const courses_string = encodeURIComponent(JSON.stringify(courses));
        const url = "/export?data=" + courses_string;
        window.location.href = url;
    }

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const categorizedCourses = categorizeCourses(courses);

    return (
        <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="planner-container">
                {/* Sidebar Toggle Button */}
                <button 
                    className={`sidebar-toggle ${!sidebarOpen ? 'closed' : ''}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle Sidebar"
                    style={{zIndex: 1}}
                >
                    {sidebarOpen ? '◀' : '▶'}
                </button>

                {/* Sidebar */}
                <aside className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
                    <div className="sidebar-header">
                        <button onClick={() => window.location.href = '/'} className="back-button">
                            Back to TES
                        </button>
                    </div>
                    
                    <div className="sidebar-categories">
                        {Object.keys(categorizedCourses).map(categoryName => (
                            <SidebarCategory
                                key={categoryName}
                                title={categoryName}
                                courses={categorizedCourses[categoryName]}
                                isExpanded={expandedCategories[categoryName]}
                                onToggle={() => toggleCategory(categoryName)}
                            />
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
                    { 
                        alert_warning_text !== "" && (
                            <Alert severity="warning" onClose={() => {SetAlertWarningText("")}} style={{zIndex: 99}}>
                                <AlertTitle>
                                    Warning
                                </AlertTitle>
                                {alert_warning_text};
                            </Alert>
                        )
                    }
                    { 
                        alert_error_text !== "" && (
                            <Alert severity="error" onClose={() => {SetAlertErrorText("")}} style={{zIndex: 99}}>
                                <AlertTitle>
                                    Error
                                </AlertTitle>
                                {alert_error_text};
                            </Alert>
                        )
                    }
                    <div className="page-header">
                        <h1 className="page-title">Course Plan</h1>
                        <div className="action-buttons">
                            <button className="btn btn-save" onClick={handleSave}>
                                Save Plan
                            </button>
                            <button className="btn btn-load" onClick={handleReset}>
                                Reset Plan
                            </button>
                            <button className="btn btn-export" onClick={handleExport}>
                                Export Plan
                            </button>
                        </div>
                    </div>

                    <div className="semesters-grid">
                        {semesters.map((semester) => (
                            <SemesterGroup key={semester} semester_name={semester}>
                                {courses.filter((course) => (course && course.semester === semester)).map((course) => (
                                    <div key={course.id}>
                                        <CourseNode 
                                            course_id={course.id} 
                                            course_code={course.course_code} 
                                            course_desc={course.course_desc} 
                                        />
                                    </div>
                                ))}
                            </SemesterGroup>
                        ))}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}

export default PlannerPrototype;