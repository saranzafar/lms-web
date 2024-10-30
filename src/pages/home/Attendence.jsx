import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import conf from "../../conf/conf";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames';
import { getDataFromLocalStorage } from '../../utils/localStorage';

function Attendence() {
    const [selectedSubData, setSelectedSubData] = useState([]);
    const [grade, setGrade] = useState("");
    const [gradeButtonLoading, setGradeButtonLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [tokenData, setTokenData] = useState({ token: '', admin: {} });

    useEffect(() => {
        const retrievedToken = getDataFromLocalStorage('token');
        const retrievedAdminData = JSON.parse(getDataFromLocalStorage('admin'));
        setTokenData({ token: retrievedToken, admin: retrievedAdminData });
    }, []);

    const handleAttendanceChange = (studentId, value) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const [formData, setFormData] = useState({
        grade: '',
        subject: '',
        teacher: '',
        date: '',
        user: '',
        attendance: []
    });

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        setGradeButtonLoading(true);
        try {
            const id = tokenData.admin?._id;
            const response = await axios.post(`${conf.backendUrl}timetable/get-subject-by-grade`, { grade, id }, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                },
            });
            setSelectedSubData(response?.data?.data?.subjects || []);
            getAllStudents();
        } catch (err) {
            toast.error(`${err?.response?.data?.message || "Error while fetching subjects"}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        } finally {
            setGradeButtonLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonLoading(true);
        try {
            const { admin: { _id: userId } } = tokenData;
            const payload = {
                ...formData,
                user: userId,
                attendance: Object.keys(attendanceData).map(studentId => ({
                    student: studentId,
                    status: attendanceData[studentId]
                }))
            };

            await axios.post(`${conf.backendUrl}attendence/add-attendence`, payload, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                },
            });
            toast.success("Timetable added successfully", {
                position: "bottom-right",
                autoClose: 2000,
            });
            setFormData({
                grade: '',
                subject: '',
                teacher: '',
                date: '',
                user: '',
                attendance: []
            });
            setAttendanceData({});
        } catch (error) {
            console.error("add attendence error", error);
            toast.error(error?.response?.data?.message || "Error while adding timetable", {
                position: "bottom-right",
                autoClose: 2000,
            });
        } finally {
            setButtonLoading(false);
        }
    };

    const handleSubjectChange = (subjectId) => {
        const selectedSubject = selectedSubData.find(sub => sub._id === subjectId);
        setFormData(prevFormData => ({
            ...prevFormData,
            subject: subjectId,
            teacher: selectedSubject?.teacher?._id || '',
            grade: selectedSubject?.grade || ''
        }));
    };

    const getAllStudents = async () => {
        try {
            const id = tokenData.admin?._id;
            console.log("id for all students: ", id);

            const response = await axios.post(`${conf.backendUrl}attendence/get-all-same-students/${id}`, { grade }, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`
                }
            });
            console.log("RESPONSE: ", response.data);

            setAllStudents(response?.data?.data?.students || []);
        } catch (err) {
            toast.error(err.response.data.data.message);
        }
    };

    const [secondGrade, setSecondGrade] = useState("");
    const [secondGradeButtonLoading, setSecondGradeButtonLoading] = useState(false);
    const [attendenceButtonLoading, setAttendenceButtonLoading] = useState(false);
    const [selectedSecondSubData, setSelectedSecondSubData] = useState([]);
    const [secondFormData, setSecondFormData] = useState({ subject: '' });
    const [attendance, setAttendence] = useState([]);
    const [allGrades, setAllGrades] = useState([]);

    const handleSecongGradeSubmit = async (e) => {
        e.preventDefault();
        setSecondGradeButtonLoading(true);
        const id = tokenData.admin?._id;
        const grade = secondGrade;
        try {
            const response = await axios.post(`${conf.backendUrl}timetable/get-subject-by-grade`, { grade, id }, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                },
            });
            setSelectedSecondSubData(response?.data?.data?.subjects || []);
        } catch (err) {
            toast.error(`${err?.response?.data?.message || "Error while fetching subjects"}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        } finally {
            setSecondGradeButtonLoading(false);
        }
    };

    const fetchAttendence = async (e) => {
        e.preventDefault();
        setAttendenceButtonLoading(true);
        const { admin: { _id: userId } } = tokenData;
        const payload = {
            user: userId,
            grade: secondGrade,
            subject: secondFormData
        };
        try {
            const response = await axios.post(`${conf.backendUrl}attendence/get-attendence`, payload, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                },
            });
            setAttendence(response?.data?.data);
            setSecondFormData({ subject: '' });
        } catch (error) {
            console.error("add attendence error", error);
            toast.error(error?.response?.data?.message || "Error while fetching timetable", {
                position: "bottom-right",
                autoClose: 2000,
            });
        } finally {
            setAttendenceButtonLoading(false);
        }
    };

    const uniqueDates = Array.from(new Set(attendance.map(record => new Date(record.date).toLocaleDateString())));
    const students = attendance.flatMap(record => record.attendance.map(a => ({
        ...a.student,
        status: a.status,
        date: new Date(record.date).toLocaleDateString(),
    })));

    const studentRecords = students.reduce((acc, student) => {
        const { _id, name, rollNo, date, status } = student;
        if (!acc[_id]) {
            acc[_id] = { name, rollNo, attendance: {} };
        }
        acc[_id].attendance[date] = status;
        return acc;
    }, {});

    const studentList = Object.values(studentRecords);

    const calculatePercentage = (student) => {
        const totalDays = uniqueDates.length;
        const attendedDays = Object.values(student.attendance).filter(status => status === '1').length;
        return ((attendedDays / totalDays) * 100).toFixed(2);
    };

    const getAllGrades = async () => {
        const user = tokenData.admin._id;
        try {
            const response = await axios.get(`${conf.backendUrl}admin/get-all-grades/${user}`, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                },
            });
            setAllGrades(response.data?.data?.gradename);
        } catch (err) {
            toast.error(`${err.response?.data?.message || "Network Issue"}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        }
    };

    useEffect(() => {
        if (tokenData.token) getAllGrades();
    }, [tokenData]);

    return (
        <section>
            <ToastContainer />
            <div className="flex items-center justify-center py-10 w-full">
                <div className="min-w-96 w-full mx-auto">
                    <h2 className="text-center text-2xl font-bold leading-tight text-gray-700">
                        Add Attendence
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already added?{' '}
                        <Link
                            to="/home"
                            title="Go to Home"
                            className="font-semibold text-gray-700 transition-all duration-200 hover:underline"
                        >
                            Go to Home?
                        </Link>
                    </p>

                    {/* Grade Selection Form */}
                    <form className="mt-8 pb-16 w-full" onSubmit={handleGradeSubmit}>
                        <div className="space-y-5 w-2/3 mx-auto flex">
                            <div className="w-5/6 pr-2">
                                <label htmlFor="grade" className="text-base font-medium text-gray-700">
                                    Select Grade
                                </label>
                                <div className="mt-2">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                                        id="grade"
                                        required
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                    >
                                        <option value="" disabled className='text-black'>Select Grade</option>
                                        {allGrades?.map((grade) => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="w-1/6 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex w-44 mt-3 items-center h-10 justify-center rounded-md bg-black font-semibold leading-7 text-white hover:bg-black/80"
                                    disabled={gradeButtonLoading}
                                >
                                    {gradeButtonLoading ? 'Please wait...' : 'Select'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Timetable Form */}
                    {selectedSubData?.length > 0 && (
                        <form className="mt-8 pb-16 w-full" onSubmit={handleSubmit}>
                            <div className="space-y-5 w-2/3 mx-auto">
                                <div>
                                    <label htmlFor="grade" className="text-base font-medium text-gray-700">
                                        Grade
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                                            type="text"
                                            placeholder="Subject Name"
                                            id="grade"
                                            value={selectedSubData[0]?.grade || ''}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="text-base font-medium text-gray-700">
                                        Select Subject
                                    </label>
                                    <div className="mt-2">
                                        <select
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                                            id="subject"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => handleSubjectChange(e.target.value)}
                                        >
                                            <option value="" disabled>Select Subject</option>
                                            {selectedSubData?.map((sub) => (
                                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="teacher" className="text-base font-medium text-gray-700">
                                        Teacher
                                    </label>
                                    <div className="mt-2">
                                        <select
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                                            id="teacher"
                                            required
                                            value={formData.teacher}
                                            onChange={(e) => handleChange('teacher', e.target.value)}
                                        >
                                            <option value="" disabled>Select Teacher</option>
                                            {selectedSubData
                                                .filter(sub => sub._id === formData.subject)
                                                .map(sub => (
                                                    <option key={sub.teacher._id} value={sub.teacher._id}>{sub.teacher.name}</option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="date" className="text-base font-medium text-gray-700">
                                        Date
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                                            type="date"
                                            id="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => handleChange('date', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student Name
                                                </th>
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Roll Number
                                                </th>
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Attendance
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allStudents?.map((student) => (
                                                <tr key={student._id}>
                                                    <td className="py-2 px-6 text-sm text-gray-700">{student.name} {student.fatherName}</td>
                                                    <td className="py-2 px-6 text-sm text-gray-700">{student.rollNo}</td>
                                                    <td className="py-2 px-6 text-sm text-gray-700">
                                                        <div className="flex space-x-2">
                                                            {/* Green Circle for Present */}
                                                            <span
                                                                className={`w-6 h-6 rounded-full cursor-pointer text-center ${attendanceData[student._id] === '1' ? 'bg-green-500' : 'bg-gray-300'}`}
                                                                onClick={() => handleAttendanceChange(student._id, '1')}
                                                            >
                                                                {attendanceData[student._id] === '1' && <span className="text-white font-bold text-xs">P</span>}
                                                            </span>
                                                            {/* Red Circle for Absent */}
                                                            <span
                                                                className={`w-6 h-6 rounded-full cursor-pointer text-center ${attendanceData[student._id] === '0' ? 'bg-red-500' : 'bg-gray-300'}`}
                                                                onClick={() => handleAttendanceChange(student._id, '0')}
                                                            >
                                                                {attendanceData[student._id] === '0' && <span className="text-white font-bold text-xs">A</span>}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="w-full mt-6 inline-flex items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                                        disabled={buttonLoading}
                                    >
                                        {buttonLoading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* display all attendence  */}
                    <h2 className="border-t w-10/12 mx-auto pt-8 mt-8 text-center text-2xl font-bold leading-tight text-gray-700">
                        Attendence will appears here
                    </h2>
                    {/* Grade Selection Form */}
                    <form className="pb-16 w-full" onSubmit={handleSecongGradeSubmit}>
                        <div className="space-y-5 w-2/3 mx-auto flex">
                            <div className="w-5/6 pr-2">
                                <label htmlFor="grade" className="text-base font-medium text-gray-700">
                                    Select Grade
                                </label>
                                <div className="mt-2">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                                        id="grade"
                                        required
                                        value={secondGrade}
                                        onChange={(e) => setSecondGrade(e.target.value)}
                                    >
                                        <option value="" disabled>Select Grade</option>
                                        {allGrades?.map((grade) => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="w-1/6 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex w-44 mt-3 items-center h-10 justify-center rounded-md bg-black font-semibold leading-7 text-white hover:bg-black/80"
                                    disabled={secondGradeButtonLoading}
                                >
                                    {secondGradeButtonLoading ? 'Please wait...' : 'Select'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* subject selection  */}
                    {selectedSecondSubData?.length > 0 && (
                        <form className="mt-2 pb-16 w-full" onSubmit={fetchAttendence}>
                            <div className="space-y-5 w-2/3 mx-auto border-t pt-8">
                                <div>
                                    <label htmlFor="grade" className="text-base font-medium text-gray-700">
                                        Grade
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                                            type="text"
                                            placeholder="Subject Name"
                                            id="grade"
                                            value={selectedSecondSubData[0]?.grade || ''}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className='flex'>
                                    <div className=' w-5/6'>
                                        <label htmlFor="subject" className="text-base font-medium text-gray-700">
                                            Select Subject
                                        </label>
                                        <div className="mt-2">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                                                id="subject"
                                                required
                                                value={secondFormData.subject}
                                                onChange={(e) => setSecondFormData(e.target.value)}
                                            >
                                                <option value="" disabled>Select Subject</option>
                                                {selectedSecondSubData?.map((sub) => (
                                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className='ml-2 mt-2 w-1/6'>
                                        <button
                                            type="submit"
                                            className="w-full h-10 mt-6 inline-flex items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                                            disabled={attendenceButtonLoading}
                                        >
                                            {attendenceButtonLoading ? 'Showing...' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* showing attendence  */}
                    {attendance?.length ?
                        <div className="p-4 w-11/12 mx-auto">
                            <div className="mb-4">
                                <p className="font-bold text-lg">Grade: {attendance[0].grade}</p>
                                <p className="font-bold text-lg">Subject: {attendance[0].subject.name}</p>
                                <p className="font-bold text-lg">Teacher: {attendance[0].teacher.name}</p>
                            </div>
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead>
                                    <tr>
                                        <th className="border p-2">Student Name</th>
                                        <th className="border p-2">Roll No</th>
                                        {uniqueDates.map((date, index) => (
                                            <th key={index} className="border p-2">{date}</th>
                                        ))}
                                        <th className="border p-2">Classes Attended</th>
                                        <th className="border p-2">Total Classes</th>
                                        <th className="border p-2">Attendance Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentList?.map((student, index) => (
                                        <tr key={index}>
                                            <td className="border p-2">{student.name}</td>
                                            <td className="border p-2">{student.rollNo}</td>
                                            {uniqueDates.map((date, idx) => (
                                                <td key={idx} className="border p-2">
                                                    <span
                                                        className={classNames(
                                                            'inline-block w-5 h-5 text-center text-white text-sm rounded-full',
                                                            student.attendance[date] === '1' ? 'bg-green-500' : 'bg-red-500'
                                                        )}
                                                    >{student.attendance[date] === '1' ? 'P' : 'A'}</span>
                                                </td>
                                            ))}
                                            <td className="border p-2">
                                                {Object.values(student.attendance).filter(status => status === '1').length}
                                            </td>
                                            <td className="border p-2">{uniqueDates.length}</td>
                                            <td className="border p-2">{calculatePercentage(student)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div> : null}
                </div>
            </div>
        </section>
    );
}

export default Attendence;
