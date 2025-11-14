import React, { useState } from "react";

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
    const [courses, setCourses] = useState([]);
    const [nextCourseId, setNextCourseId] = useState(1000);
    const [draggingFrom, setDraggingFrom] = useState(null);

    const courseCatalog = [
        {
            category: "GEP", items: [
                { id: "ENGL100", code: "ENGL 100", placeholder: "N/A" },
                { id: "GEP-AH", code: "N/A", placeholder: "Arts and Humanities", count: 2 },
                { id: "GEP-SS", code: "N/A", placeholder: "Social Sciences", count: 3 },
                { id: "MATH151", code: "MATH 151", placeholder: "N/A" },
                { id: "MATH152", code: "MATH 152", placeholder: "N/A" },
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
                { id: "CMSC201", code: "CMSC 201", placeholder: "N/A" },
                { id: "CMSC202", code: "CMSC 202", placeholder: "N/A" },
                { id: "CMSC203", code: "CMSC 203", placeholder: "N/A" }
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
                    prerequisites: []
                };

                setCourses(prev => [...prev, newCourse]);
                setNextCourseId(prev => prev + 1);
            }
        } else {
            // Moving existing course between semesters
            const courseId = Number(draggedId);
            setCourses(prev =>
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
            setCourses(prev => prev.filter(course => course.id !== courseId));
        }
        
        setDraggingFrom(null);
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400..700&display=swap');

                .sidebar {
                    background-color: #f8f9fa;
                    border-right: 2px solid #dee2e6;
                    transition: width 0.3s ease;
                    flex-shrink: 0;
                    height: 100vh;
                    position: fixed;
                    left: 0;
                    top: 0;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .sidebar.open {
                    width: 320px;
                }

                .sidebar.closed {
                    width: 50px;
                }

                .sidebar-toggle {
                    padding: 1rem;
                    background-color: rgba(225, 225, 225, 1);
                    cursor: pointer;
                    width: 100%;
                    text-align: center;
                    font-size: 1.2rem;
                    font-weight: bold;
                    font-family: 'AR One Sans';
                    border: none;
                }

                .sidebar-toggle:hover {
                    background-color: #c0c0c0;
                }

                .sidebar-content {
                    padding: 1rem;
                    overflow-y: auto;
                    overflow-x: hidden;
                    flex: 1;
                    max-height: calc(100vh - 60px);
                }

                .category-section {
                    margin-bottom: 1.5rem;
                }

                .category-header {
                    font-family: 'AR One Sans';
                    font-weight: 600;
                    font-size: 14pt;
                    margin-bottom: 0.5rem;
                    padding: 0.5rem;
                    background-color: rgba(225, 225, 225, 1);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    user-select: none;
                }

                .category-header:hover {
                    background-color: #c0c0c0;
                }

                .catalog-item {
                    font-family: 'AR One Sans';
                    font-size: 12pt;
                    padding: 0.5rem 0.8rem;
                    margin: 0.25rem 0;
                    background-color: white;
                    border: 2px solid rgba(225, 225, 225, 1);
                    border-radius: 6px;
                    cursor: move;
                    user-select: none;
                }

                .catalog-item:hover {
                    background-color: #f0f0f0;
                    border-color: #999;
                }

                .page-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    min-height: 100vh;
                    background-color: white;
                    padding: 20px;
                    margin-left: 50px;
                    transition: margin-left 0.3s ease;
                }

                .sidebar.open ~ .page-container {
                    margin-left: 320px;
                }

                .row-container {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    justify-content: center;
                    width: 100%;
                    max-width: 1200px;
                }

                .col-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .medium-text {
                    font-family: 'AR One Sans';
                    font-weight: 550;
                    font-size: 24pt;
                    text-align: left;
                    width: 100%;
                    margin-bottom: 20px;
                }

                .body-text {
                    font-family: 'AR One Sans';
                    font-weight: 650;
                    font-size: 16pt;
                    text-align: center;
                }

                .course-node-container .body-text {
                    font-size: 12pt;
                    font-weight: 500;
                }

                .course-node-container {
                    background-color: rgba(225, 225, 225, 1);
                    padding: 10px;
                    border-radius: 10px;
                    cursor: grab;
                    user-select: none;
                    width: 100%;
                    max-width: 100%;
                    min-width: 0;
                    box-sizing: border-box;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .course-node-container:active {
                    cursor: grabbing;
                }

                .course-node-group-container {
                    width: 20vw;
                    min-width: 180px;
                    max-width: 300px;
                    min-height: 60px;
                    padding: 10px;
                    border-radius: 10px;
                    border: 2px solid rgba(225, 225, 225, 1);
                    gap: 12px;
                    box-sizing: border-box;
                }

                .nav-btn {
                    background-color: rgba(225, 225, 225, 1);
                    font-family: 'AR One Sans';
                    font-weight: 600;
                    font-size: 14pt;
                    padding: 8px 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    border: none;
                    align-self: flex-start;
                }

                .nav-btn:hover {
                    background-color: #c0c0c0;
                }
            `}</style>

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
            </div>
        </div>
    );
}

export default Planner;