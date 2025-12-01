import React, { useState } from "react";
import '../styles/TransferCoursesPage.css';
function TransferCoursesPage() {
  const [rows, setRows] = useState([
    { id: 1, university: "", course: "", grade: "", equivalent: "", notes: "" }
  ]);
  const [nextId, setNextId] = useState(2);
  const [expandedSites, setExpandedSites] = useState({
    TES: false,
    ARTSYS: false,
    catalog: false
  });
  const [websiteHeight, setWebsiteHeight] = useState(50); // vh units
  const [isDragging, setIsDragging] = useState(false);

  const websites = [
    {
      key: "TES",
      name: "Transfer Evaluation System",
      url: "https://tes.collegesource.com/publicview/TES_publicview01.aspx?rid=bb8265b7-2b52-48eb-a896-e3d87f63fb34&aid=f0b57e87-5301-478d-87f9-9b6d699097f1",
      canEmbed: true
    },
    {
      key: "ARTSYS",
      name: "ARTSYS",
      url: "https://articulation.usmd.edu/equivalencies",
      canEmbed: false
    },
    {
      key: "catalog",
      name: "Exam Score Transfer",
      url: "https://catalog.umbc.edu/content.php?catoid=40&navoid=2862&print",
      canEmbed: false
    }
  ];

  const addRow = () => {
    setRows([...rows, { id: nextId, university: "", course: "", grade: "", equivalent: "", notes: "" }]);
    setNextId(nextId + 1);
  };

  const deleteRow = (id) => {
    const rowToDelete = rows.find(r => r.id === id);
    const isRowEmpty = !rowToDelete.university && !rowToDelete.course && !rowToDelete.grade && !rowToDelete.equivalent && !rowToDelete.notes;

    if (rows.length === 1) {
      setRows([{ id: rows[0].id, university: "", course: "", grade: "", equivalent: "", notes: "" }]);
      return;
    }

    if (isRowEmpty) {
      setRows(rows.filter(r => r.id !== id));
      return;
    }

    if (window.confirm("This row has content. Are you sure you want to delete it?")) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const toggleSite = (siteKey) => {
    setExpandedSites(prev => ({
      ...prev,
      [siteKey]: !prev[siteKey]
    }));
  };

  const openAllSites = () => {
    setExpandedSites({
      TES: true,
      ARTSYS: true,
      catalog: true
    });
  };

  const closeAllSites = () => {
    setExpandedSites({
      TES: false,
      ARTSYS: false,
      catalog: false
    });
  };

  const openInNewWindow = (url, width = 1200, height = 800) => {
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(
      url, 
      '_blank', 
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const anySiteOpen = Object.values(expandedSites).some(v => v);
  const openSitesCount = Object.values(expandedSites).filter(v => v).length;

  // Handle dragging for resizing
  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newHeight = (e.clientY / window.innerHeight) * 100;
      // Constrain between 20vh and 80vh
      if (newHeight >= 20 && newHeight <= 80) {
        setWebsiteHeight(newHeight);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Determine grid layout based on number of open sites
  const getGridStyle = () => {
    if (openSitesCount === 0) return {};
    if (openSitesCount === 1) return { display: 'grid', gridTemplateColumns: '1fr', gap: '15px' };
    if (openSitesCount === 2) return { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
    if (openSitesCount === 3) return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' };
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      maxWidth: '100%',
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        color: '#000000',
        marginBottom: '30px',
        fontSize: '2rem',
        fontWeight: '600'
      }}>Transfer Courses</h1>

      {/* Website Resources Section */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          display: 'flex',
          gap: '10px',
          marginBottom: '15px',
          flexWrap: 'wrap'
        }}>
          {websites.map(site => (
            <button
              key={site.key}
              onClick={() => toggleSite(site.key)}
              style={{
                padding: '10px 20px',
                backgroundColor: expandedSites[site.key] ? '#000000' : '#fdb515',
                color: expandedSites[site.key] ? '#fdb515' : '#000000',
                border: '#000000',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              {expandedSites[site.key] ? '✕' : ' '} {site.name}
            </button>
          ))}
          <button
            onClick={openAllSites}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007176',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Open All
          </button>
          {anySiteOpen && (
            <button
              onClick={closeAllSites}
              style={{
                padding: '10px 20px',
                backgroundColor: '#da2128',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Close All
            </button>
          )}
        </div>

        {/* Embedded iframes or alternative display - Grid Layout */}
        {anySiteOpen && (
          <>
            <div style={{
              ...getGridStyle(),
              height: `${websiteHeight}vh`,
              marginBottom: '0px',
              position: 'relative'
            }}>
              {websites.map(site => (
                expandedSites[site.key] && (
                  <div key={site.key} style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      flexShrink: 0
                    }}>
                      <h3 style={{ margin: 0, fontSize: '14px', color: '#555', fontWeight: '600' }}>
                        {site.name}
                      </h3>
                      <button
                        onClick={() => toggleSite(site.key)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#da2128',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Close
                      </button>
                    </div>
                    
                    {site.canEmbed ? (
                      <iframe
                        src={site.url}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          flexGrow: 1
                        }}
                        title={site.name}
                      />
                    ) : (
                      <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px',
                        border: '2px dashed #ccc',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexGrow: 1
                      }}>
                        <p style={{ 
                          color: '#666', 
                          marginBottom: '12px',
                          fontSize: '13px' 
                        }}>
                          ⚠️ Cannot open this website here
                        </p>
                        <button
                          onClick={() => openInNewWindow(site.url)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          🗗 Open in Window
                        </button>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
            {/* Resizable Drag Handle */}
            <div
              onMouseDown={handleMouseDown}
              style={{
                height: '10px',
                cursor: 'ns-resize',
                backgroundColor: isDragging ? '#1976d2' : '#e0e0e0',
                borderRadius: '5px',
                margin: '5px 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: isDragging ? 'none' : 'background-color 0.2s',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => !isDragging && (e.target.style.backgroundColor = '#bdbdbd')}
              onMouseLeave={(e) => !isDragging && (e.target.style.backgroundColor = '#e0e0e0')}
            >
              <div style={{
                width: '40px',
                height: '3px',
                backgroundColor: isDragging ? 'white' : '#999',
                borderRadius: '2px'
              }}></div>
            </div>
          </>
        )}
      </div>

      {/* Transfer Courses Table */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <table style={{ 
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '900px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={headerStyle}>University/ Exam</th>
              <th style={headerStyle}>Course</th>
              <th style={headerStyle}>Grade</th>
              <th style={headerStyle}>UMBC Course Equivalence</th>
              <th style={headerStyle}>Notes</th>
              <th style={{ ...headerStyle, width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={cellStyle}>
                  <input
                    type="text"
                    value={row.university}
                    onChange={(e) => updateRow(row.id, "university", e.target.value)}
                    placeholder="e.g., CCBC"
                    style={inputStyle}
                  />
                </td>
                <td style={cellStyle}>
                  <input
                    type="text"
                    value={row.course}
                    onChange={(e) => updateRow(row.id, "course", e.target.value)}
                    placeholder="e.g., ENGL 101"
                    style={inputStyle}
                  />
                </td>
                <td style={cellStyle}>
                  <input
                    type="text"
                    value={row.grade}
                    onChange={(e) => updateRow(row.id, "grade", e.target.value)}
                    placeholder="e.g., A"
                    style={inputStyle}
                  />
                </td>
                <td style={cellStyle}>
                  <input
                    type="text"
                    value={row.equivalent}
                    onChange={(e) => updateRow(row.id, "equivalent", e.target.value)}
                    placeholder="e.g., ENGL 100"
                    style={inputStyle}
                  />
                </td>
                <td style={cellStyle}>
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(e) => updateRow(row.id, "notes", e.target.value)}
                    placeholder="Notes"
                    style={inputStyle}
                  />
                </td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  <button
                    onClick={addRow}
                    style={addButtonStyle}
                    title="Add row"
                  >
                    +
                  </button>
                  <button
                    onClick={() => deleteRow(row.id)}
                    style={deleteButtonStyle}
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

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={() => window.location.href = '/planner-prototype'}
          style={{
            padding: '12px 30px',
            background: '#000000',
            color: '#fdb515',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Go to Planner
        </button>
      </div>
    </div>
  );
}

const headerStyle = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#333',
  borderBottom: '2px solid #ddd'
};

const cellStyle = {
  padding: '10px'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const addButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#4caf50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  marginRight: '5px',
  fontWeight: 'bold'
};

const deleteButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold'
};

export default TransferCoursesPage;