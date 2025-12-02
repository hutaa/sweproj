import React, {useState, useEffect} from "react";
import { useSearchParams } from "react-router";

import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import "../styles/Export.css"

function CourseEntry({courseText, credits = 0})
{
    return (
        <tr>
            <td className="courses">
                {courseText}
            </td>
            <td className="credits">
                {credits}
            </td>
        </tr>
    );
}

function SemesterEntry({semesterHeader = "Unnamed Semester", totalCredits, children})
{
    return (
        <table className="pathway_semester_container">
            <tbody>
                <tr className="semester_header">
                    <th className="courses">
                        {semesterHeader}
                    </th>
                    <th className="credits">
                        Credits
                    </th>
                </tr>
                {children}
                <tr>
                    <td className="credit_total_title">
                        <b>
                        Total
                        </b>
                    </td>
                    <td className="credits">
                        {totalCredits}
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

function YearEntry({yearHeader = "Year Zero", semesterOne, semesterTwo})
{
    return (
        <table width="100%" className="pathway_year_container">
            <tbody>
                <tr className="pathway_year">
                    <th className="year" colSpan="2">
                        {yearHeader}
                    </th>
                </tr>
                <tr>
                    <td width="50%" className="full" style={{verticalAlign: "top"}}>
                        {semesterOne}
                    </td>
                    <td width="50%" className="full" style={{verticalAlign: "top"}}>
                        {semesterTwo}
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

function ExportedPlan()
{
    const [courses, SetCourses] = useState([]);

    const [searchParams, SetSearchParams] = useSearchParams();
    const [earliestSemester, SetEarliestSemester] = useState(null);
    const [earliestYear, SetEarliestYear] = useState(null);

    const [formattedPlan, SetFormattedPlan] = useState([
        // {year: 0, semesterOne: {semester: "", courses: [], totalCredits: 0}, semesterTwo: {semester: "", courses: [], totalCredits: 0}}
    ]);

    const [alert_success_text, SetAlertSuccessText] = useState("");
    
    // Load Courses from URL if saved.
    useEffect(() =>
        {
            const courses_string = searchParams.get("data");

            if (courses_string) {
                SetCourses(JSON.parse(decodeURIComponent(courses_string)));

                // Calculate constant values for earliest year and earliest semester.

                var new_earliest_year;
                var new_earliest_semester;

                for (var i = 0; i < courses.length; i++)
                {
                    if (!new_earliest_year || Math.floor(SemesterToInt(courses[i].semester) / 10) < new_earliest_year)
                    {
                        new_earliest_year = Math.floor(SemesterToInt(courses[i].semester) / 10);
                    }
                    if (!new_earliest_semester || SemesterToInt(courses[i].semester) < new_earliest_semester)
                    {
                        new_earliest_semester = SemesterToInt(courses[i].semester);
                    }
                }

                SetEarliestSemester(new_earliest_semester);
                SetEarliestYear(new_earliest_year);
            }
        }
    , [searchParams]);

    useEffect (() =>
        {
            // Produce a formatted course plan using the array of courses.

            var newFormattedPlan = [];

            var yearEntryIndex = null;

            for (var i = 0; i < courses.length; i++)
            {
                yearEntryIndex = null;

                if (!(courses[i]) || !(courses[i]["semester"]) || SemesterToInt(courses[i]["semester"]) === 0)
                {
                    continue;
                }

                for (var v = 0; v < newFormattedPlan.length; v++)
                {
                    if (newFormattedPlan[v]["year"] === Math.floor(SemesterToInt(courses[i].semester) / 10))
                    {
                        yearEntryIndex = v;
                        break;
                    }
                }

                if (yearEntryIndex === null)
                {
                    newFormattedPlan.push({
                        year: Math.floor(SemesterToInt(courses[i].semester) / 10), 
                        semesterOne: {
                            semester: "SP" + Math.floor(SemesterToInt(courses[i].semester) / 10), 
                            courses: [], 
                            totalCredits: 0
                        }, 
                        semesterTwo: {
                            semester: "FA" + Math.floor(SemesterToInt(courses[i].semester) / 10), 
                            courses: [], 
                            totalCredits: 0
                        }
                    });

                    yearEntryIndex = newFormattedPlan.length - 1;
                }

                if (newFormattedPlan[yearEntryIndex]["semesterOne"]["semester"] === courses[i].semester)
                {
                    newFormattedPlan[yearEntryIndex]["semesterOne"]["courses"].push(courses[i]);
                    newFormattedPlan[yearEntryIndex]["semesterOne"]["totalCredits"] += courses[i]["credits"];
                }
                else if (newFormattedPlan[yearEntryIndex]["semesterTwo"]["semester"] === courses[i].semester)
                {
                    newFormattedPlan[yearEntryIndex]["semesterTwo"]["courses"].push(courses[i]);
                    newFormattedPlan[yearEntryIndex]["semesterTwo"]["totalCredits"] += courses[i]["credits"];
                }
            }

            newFormattedPlan.sort((a, b) => a["year"] - b["year"]);

            console.log(newFormattedPlan);

            SetFormattedPlan(newFormattedPlan);
        }
    , [courses]); 

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

    function ExportAsMarkdown()
    {
        var exported_string = "&nbsp;|&nbsp;|&nbsp;|&nbsp;\n-|-|-|-\n"
        // {year: 0, semesterOne: {semester: "", courses: [], totalCredits: 0}, semesterTwo: {semester: "", courses: [], totalCredits: 0}}
        for (var y = 0; y < formattedPlan.length; y++)
        {
            exported_string += formattedPlan[y]["semesterOne"]["totalCredits"] > 0 ? "Spring " + formattedPlan[y]["year"] + " Semester|Credits|" : "&nbsp;|&nbsp;|";
            exported_string += formattedPlan[y]["semesterTwo"]["totalCredits"] > 0 ? "Fall " + formattedPlan[y]["year"] + " Semester|Credits" : "&nbsp;|&nbsp;";
            exported_string += "\n";

            for (var c = 0; c < Math.max(formattedPlan[y]["semesterOne"]["courses"].length, formattedPlan[y]["semesterTwo"]["courses"].length); c++)
            {
                exported_string += c < formattedPlan[y]["semesterOne"]["courses"].length
                    ? formattedPlan[y]["semesterOne"]["courses"][c].course_code + " "
                    + formattedPlan[y]["semesterOne"]["courses"][c].course_desc + "|"
                    + formattedPlan[y]["semesterOne"]["courses"][c].credits + "|"
                    : "&nbsp;|&nbsp;|";
                exported_string += c < formattedPlan[y]["semesterTwo"]["courses"].length
                    ? formattedPlan[y]["semesterTwo"]["courses"][c].course_code + " "
                    + formattedPlan[y]["semesterTwo"]["courses"][c].course_desc + "|"
                    + formattedPlan[y]["semesterTwo"]["courses"][c].credits
                    : "&nbsp;|&nbsp;";
                exported_string += "\n";
            }

            exported_string += (formattedPlan[y]["semesterOne"]["courses"].length === 0 ? "&nbsp;|&nbsp;" : "Total|" + formattedPlan[y]["semesterOne"]["totalCredits"]) + "|";
            exported_string += (formattedPlan[y]["semesterTwo"]["courses"].length === 0 ? "&nbsp;|&nbsp;" : "Total|" + formattedPlan[y]["semesterTwo"]["totalCredits"]) + "|";
            exported_string += "\n&nbsp;|&nbsp;|&nbsp;|&nbsp;\n";
        }

        navigator.clipboard.writeText(exported_string);
        SetAlertSuccessText("Copied to Clipboard");
    }

    return (
        <div className="page-container">
            {
                alert_success_text !== "" && (
                    <Alert severity="success" onClose={() => {SetAlertSuccessText("")}} style={{position: "absolute", zIndex: 99}}>
                        <AlertTitle style={{textAlign: "left"}}>
                            Success
                        </AlertTitle>
                        {alert_success_text};
                    </Alert>
                )
            }
            <div style={{height: "100px"}} />
            <Button variant="contained" onClick={() => {ExportAsMarkdown()}}>
                Export as Markdown
            </Button>
            <div style={{height: "50px"}} />
            {
                formattedPlan.map((year) => (
                    <YearEntry
                        key={year["year"]}
                        yearHeader={year["year"]}
                        semesterOne={<SemesterEntry semesterHeader={year["semesterOne"]["semester"]} totalCredits={year["semesterOne"]["totalCredits"]}>
                            {
                                year["semesterOne"]["courses"].map((course) => (
                                    <CourseEntry key={course["id"]} courseText={course["course_code"] + " " + course["course_desc"]} credits={course["credits"]} />
                                ))
                            }
                        </SemesterEntry>}
                        semesterTwo={<SemesterEntry semesterHeader={year["semesterTwo"]["semester"]} totalCredits={year["semesterTwo"]["totalCredits"]}>
                            {
                                year["semesterTwo"]["courses"].map((course) => (
                                    <CourseEntry key={course["id"]} courseText={course["course_code"] + " " + course["course_desc"]} credits={course["credits"]} />
                                ))
                            }
                        </SemesterEntry>}
                    />
                ))
            }
        </div>
    )
}

export default ExportedPlan;