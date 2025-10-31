import React, {useState, useEffect} from "react";

function Menu()
{
    const majors = [
        "Computer Science",
        "Computer Engineering",
        "Information Systems"
    ];

    const [selectedMajor, setSelectedMajor] = useState("");

    return (
        <select id="majorSelection" value={selectedMajor} onChange={event => setSelectedMajor(event.target.value)}>
            {
                majors.map((major) => (
                    <option key={major} value={major}>
                        {major}
                    </option>
                ))
            }
        </select>
    );
}

export default Menu;