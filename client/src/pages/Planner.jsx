import React, { useState } from "react";

function Draggable({ id, children, onDragStart, disabled }) {
    const handleDragStart = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
        if (onDragStart) onDragStart(id);
    };

    return (
        <div
            draggable={!disabled}
            onDragStart={handleDragStart}
            style={{
                cursor: disabled ? "not-allowed" : "grab",
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

function CourseNode({ course_id, course_code, course_desc, onDragStart, transferred }) {
    return (
        <Draggable id={course_id.toString()} onDragStart={onDragStart} disabled={transferred}>
            <div style={{
                padding: '10px',
                backgroundColor: transferred ? '#e0e0e0' : '#e3f2fd',
                border: transferred ? '1px solid #9e9e9e' : '1px solid #2196f3',
                borderRadius: '6px',
                marginBottom: '8px',
                opacity: transferred ? 0.6 : 1,
                position: 'relative'
            }}>
                {transferred && (
                    <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#757575',
                        color: 'white',
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontWeight: '600'
                    }}>
                        TRANSFERRED
                    </div>
                )}
                <div style={{ fontWeight: '600', marginBottom: '4px', color: transferred ? '#666' : '#000' }}>
                    {course_code}
                </div>
                {course_desc && (
                    <div style={{ fontSize: '12px', color: transferred ? '#888' : '#555' }}>
                        {course_desc}
                    </div>
                )}
            </div>
        </Draggable>
    );
}

function SemesterGroup({ semester_name, children, onDrop }) {
    return (
        <Droppable id={semester_name} onDrop={onDrop}>
            <div style={{ 
                padding: '15px',
                backgroundColor: '#f9f9f9',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                minHeight: '400px'
            }}>
                <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '16px', color: '#333' }}>
                    {semester_name}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '60px' }}>
                    {children}
                </div>
            </div>
        </Droppable>
    );
}

// Modal Component
function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                minWidth: '400px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
                {children}
            </div>
        </div>
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

    const semesters = ["F26", "S27", "F27", "S28", "F28", "S29", "F29", "S30"];
    const [courses, SetCourses] = useState([]);
    const [nextCourseId, setNextCourseId] = useState(1000);
    const [draggingFrom, setDraggingFrom] = useState(null);

    // Modal states
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saveDescription, setSaveDescription] = useState('');
    const [savedPlans, setSavedPlans] = useState([
        { id: 1, title: "Fall 2025 Plan", description: "My initial course planning", date: "2024-11-20" },
        { id: 2, title: "Spring 2026 Plan", description: "Updated plan for spring semester", date: "2024-11-21" }
    ]);

    const courseCatalog = [
        {
            category: "GEP", items: [
                { id: "ENGL100", code: "ENGL 100", placeholder: "N/A", transferred: true },
                { id: "GEP-AH", code: "N/A", placeholder: "Arts and Humanities", count: 2, transferred: false },
                { id: "GEP-SS", code: "N/A", placeholder: "Social Sciences", count: 3, transferred: false, partialTransfer: { completed: 2, total: 3 } },
                { id: "MATH151", code: "MATH 151", placeholder: "N/A", transferred: true },
                { id: "MATH152", code: "MATH 152", placeholder: "N/A", prerequisites: ["MATH 151"], transferred: true },
                { id: "MATH221", code: "MATH 221", placeholder: "N/A", transferred: true },
                { id: "STAT355", code: "STAT 355", placeholder: "N/A", transferred: false },
                { id: "GEP-SCI", code: "N/A", placeholder: "Science Sequence", count: 2, transferred: true },
                { id: "GEP-LAB", code: "N/A", placeholder: "Science Lab", count: 1, transferred: false },
                { id: "GEP-CULT", code: "N/A", placeholder: "Culture", count: 1, transferred: false },
                { id: "GEP-LANG", code: "N/A", placeholder: "Language (Level 201+)", count: 1, transferred: false }
            ]
        },
        {
            category: "Gateway", items: [
                { id: "CMSC201", code: "CMSC 201", placeholder: "N/A", prerequisites: ["MATH 151"], transferred: true },
                { id: "CMSC202", code: "CMSC 202", placeholder: "N/A", prerequisites: ["CMSC 201"], transferred: false },
                { id: "CMSC203", code: "CMSC 203", placeholder: "N/A", prerequisites: ["MATH 151"], transferred: false }
            ]
        },
        {
            category: "Core", items: [
                { id: "CMSC304", code: "CMSC 304", placeholder: "N/A", transferred: false },
                { id: "CMSC313", code: "CMSC 313", placeholder: "N/A", transferred: false },
                { id: "CMSC331", code: "CMSC 331", placeholder: "N/A", transferred: false },
                { id: "CMSC341", code: "CMSC 341", placeholder: "N/A", transferred: false },
                { id: "CMSC447", code: "CMSC 447", placeholder: "N/A", transferred: false },
                { id: "CMSC411", code: "CMSC 411", placeholder: "N/A", transferred: false },
                { id: "CMSC421", code: "CMSC 421", placeholder: "N/A", transferred: false },
                { id: "CMSC441", code: "CMSC 441", placeholder: "N/A", transferred: false }
            ]
        },
        {
            category: "Elective", items: [
                { id: "CMSC426", code: "CMSC 426", placeholder: "N/A", transferred: false },
                { id: "CMSC431", code: "CMSC 431", placeholder: "N/A", transferred: false },
                { id: "CMSC435", code: "CMSC 435", placeholder: "N/A", transferred: false },
                { id: "CMSC448", code: "CMSC 448", placeholder: "N/A", transferred: false },
                { id: "CMSC451", code: "CMSC 451", placeholder: "N/A", transferred: false },
                { id: "CMSC455", code: "CMSC 455", placeholder: "N/A", transferred: false },
                { id: "CMSC456", code: "CMSC 456", placeholder: "N/A", transferred: false },
                { id: "CMSC461", code: "CMSC 461", placeholder: "N/A", transferred: false },
                { id: "CMSC471", code: "CMSC 471", placeholder: "N/A", transferred: false },
                { id: "CMSC481", code: "CMSC 481", placeholder: "N/A", transferred: false },
                { id: "CMSC483", code: "CMSC 483", placeholder: "N/A", transferred: false }
            ]
        },
        {
            category: "Technical Elective", items: [
                { id: "TECH-ELEC-1", code: "N/A", placeholder: "Technical Elective", count: 3, transferred: false }
            ]
        }
    ];

    const handleDragStart = (id) => {
        setDraggingFrom(id);
    };

    const handleDrop = (draggedId, targetSemester) => {
        const isFromCatalog = isNaN(Number(draggedId));

        if (isFromCatalog) {
            const catalogItem = courseCatalog
                .flatMap(cat => cat.items)
                .find(item => item.id === draggedId);

            if (catalogItem && !catalogItem.transferred) {
                const newCourse = {
                    id: nextCourseId,
                    semester: targetSemester,
                    course_code: catalogItem.code !== "N/A" ? catalogItem.code : catalogItem.placeholder,
                    course_desc: "",
                    prerequisites: catalogItem.prerequisites || [],
                    transferred: catalogItem.transferred || false
                };

                SetCourses(prev => [...prev, newCourse]);
                setNextCourseId(prev => prev + 1);
            }
        } else {
            const courseId = Number(draggedId);
            const course = courses.find(c => c.id === courseId);
            
            if (course && !course.transferred) {
                SetCourses(prev =>
                    prev.map(course =>
                        course.id === courseId ? { ...course, semester: targetSemester } : course
                    )
                );
            }
        }

        setDraggingFrom(null);
    };

    const handleSidebarDrop = (draggedId) => {
        const isFromCatalog = isNaN(Number(draggedId));
        
        if (!isFromCatalog) {
            const courseId = Number(draggedId);
            SetCourses(prev => prev.filter(course => course.id !== courseId));
        }
        
        setDraggingFrom(null);
    };

    // Save Plan Handler
    const handleSavePlan = () => {
        if (!saveTitle.trim()) {
            alert('Please enter a title for your plan');
            return;
        }

        const newPlan = {
            id: Date.now(),
            title: saveTitle,
            description: saveDescription,
            date: new Date().toISOString().split('T')[0],
            courses: courses
        };

        setSavedPlans([...savedPlans, newPlan]);
        setSaveTitle('');
        setSaveDescription('');
        setShowSaveModal(false);
        alert('Plan saved successfully!');
    };

    // Load Plan Handler
    const handleLoadPlan = (plan) => {
        if (window.confirm(`Load plan "${plan.title}"? This will replace your current plan.`)) {
            if (plan.courses) {
                SetCourses(plan.courses);
            }
            setShowLoadModal(false);
            alert('Plan loaded successfully!');
        }
    };

    // Export Plan Handler
    const handleExportPlan = () => {
        const planData = {
            title: saveTitle || 'Course Plan',
            exportDate: new Date().toISOString(),
            courses: courses,
            semesters: semesters
        };

        const dataStr = JSON.stringify(planData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${saveTitle || 'course-plan'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Plan exported successfully!');
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{
                width: sidebarOpen ? '300px' : '50px',
                backgroundColor: '#f5f5f5',
                borderRight: '1px solid #ddd',
                transition: 'width 0.3s',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '5px 10px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    {sidebarOpen ? '◀' : '▶'}
                </button>
                {sidebarOpen && (
                    <Droppable id="sidebar" onDrop={handleSidebarDrop}>
                        <div style={{ padding: '50px 15px 15px 15px' }}>
                            {courseCatalog.map((categoryGroup) => (
                                <div key={categoryGroup.category} style={{ marginBottom: '15px' }}>
                                    <div
                                        onClick={() => toggleCategory(categoryGroup.category)}
                                        style={{ 
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            padding: '8px',
                                            backgroundColor: '#e0e0e0',
                                            borderRadius: '4px',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        <span>{expandedCategories[categoryGroup.category] ? '▼' : '▶'}</span>
                                        <span style={{ marginLeft: '8px' }}>{categoryGroup.category}</span>
                                    </div>
                                    {expandedCategories[categoryGroup.category] && categoryGroup.items.map((item) => (
                                        <Draggable key={item.id} id={item.id} onDragStart={handleDragStart} disabled={item.transferred}>
                                            <div style={{
                                                padding: '8px',
                                                marginBottom: '5px',
                                                backgroundColor: item.transferred ? '#e0e0e0' : 'white',
                                                border: item.transferred ? '1px solid #9e9e9e' : '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                opacity: item.transferred ? 0.6 : 1,
                                                position: 'relative'
                                            }}>
                                                {item.transferred && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '3px',
                                                        right: '3px',
                                                        backgroundColor: '#757575',
                                                        color: 'white',
                                                        fontSize: '8px',
                                                        padding: '1px 4px',
                                                        borderRadius: '2px',
                                                        fontWeight: '600'
                                                    }}>
                                                        TRANSFERRED
                                                    </div>
                                                )}
                                                {item.partialTransfer && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '3px',
                                                        right: '3px',
                                                        backgroundColor: '#ff9800',
                                                        color: 'white',
                                                        fontSize: '8px',
                                                        padding: '1px 4px',
                                                        borderRadius: '2px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {item.partialTransfer.completed}/{item.partialTransfer.total} DONE
                                                    </div>
                                                )}
                                                {item.code !== "N/A" ? item.code : item.placeholder}
                                                {item.count && !item.partialTransfer && ` (${item.count})`}
                                                {item.partialTransfer && ` (${item.partialTransfer.total - item.partialTransfer.completed} needed)`}
                                            </div>
                                        </Draggable>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </Droppable>
                )}
            </div>

            <div style={{ flex: 1, padding: '20px' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <button 
                        onClick={() => window.location.href = '/'}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back
                    </button>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setShowSaveModal(true)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            💾 Save Plan
                        </button>
                        <button 
                            onClick={() => setShowLoadModal(true)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#2196f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            📂 Load Plan
                        </button>
                        <button 
                            onClick={handleExportPlan}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            📥 Export Plan
                        </button>
                    </div>
                </div>

                <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>
                    Course Plan
                </div>

                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    {semesters.map((semester) => (
                        <div key={semester} style={{ minWidth: '0' }}>
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
                                            transferred={course.transferred}
                                        />
                                    ))}
                            </SemesterGroup>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Plan Modal */}
            <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)}>
                <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Save Plan</h2>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                        Plan Title *
                    </label>
                    <input
                        type="text"
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        placeholder="e.g., Fall 2025 Course Plan"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                        Description
                    </label>
                    <textarea
                        value={saveDescription}
                        onChange={(e) => setSaveDescription(e.target.value)}
                        placeholder="Add notes about this plan..."
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            resize: 'vertical'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => setShowSaveModal(false)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSavePlan}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Save Plan
                    </button>
                </div>
            </Modal>

            {/* Load Plan Modal */}
            <Modal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)}>
                <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Load Plan</h2>
                {savedPlans.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                        No saved plans yet. Save your current plan to see it here!
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {savedPlans.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => handleLoadPlan(plan)}
                                style={{
                                    padding: '15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: 'white'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    e.currentTarget.style.borderColor = '#2196f3';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.borderColor = '#ddd';
                                }}
                            >
                                <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                                    {plan.title}
                                </div>
                                <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                                    {plan.description}
                                </div>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                    Saved: {plan.date}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button
                        onClick={() => setShowLoadModal(false)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default Planner;