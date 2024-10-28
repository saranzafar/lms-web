import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// import conf from "../../conf/conf"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Subject() {
    const [selectedSubData, setSelectedSubData] = useState([]);
    const [grade, setGrade] = useState("");
    const [gradeButtonLoading, setGradeButtonLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [allTimetables, setAllTimetables] = useState([]);
    const [deleteLoadingSub, setDeleteLoadingSub] = useState({});
    const [allGrades, setAllGrades] = useState([]);



    // select grade 
    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        setGradeButtonLoading(true);
        const token = await window.electronAPI.getUserData();
        const id = token?.admin?._id
        await axios.post(`${conf.backendUrl}timetable/get-subject-by-grade`, { grade, id },
            {
                headers: {
                    Authorization: `Bearer ${token?.token}`,
                },
            })
            .then((response) => {
                setGrade([])
                setSelectedSubData(response?.data?.data?.subjects)
                setGradeButtonLoading(false);
            })
            .catch((err) => {
                toast.error(`${err?.response?.data?.message}`, {
                    position: "bottom-right",
                    autoClose: 2000,
                });
                setGradeButtonLoading(false);
            });
    };

    // add time table 
    const [formData, setFormData] = useState({
        grade: '',
        subject: '',
        teacher: '',
        startTime: '08:00',
        endTime: '09:00',
        user: ''
    });

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const setFormDataBlank = () => {
        setFormData({
            grade: '',
            subject: '',
            teacher: '',
            startTime: '08:00 AM',
            endTime: '09:00 AM',
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const startTime = formData.startTime;
        const endTime = formData.endTime;

        // Convert time in "HH:MM" format to minutes since 00:00
        const convertToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };
        console.log("START: ", startTime, " END: ", endTime);

        const startMinutes = convertToMinutes(startTime);
        const endMinutes = convertToMinutes(endTime);

        // Validation: Start time and end time should be between 08:00 and 16:00 (24-hour format)
        const dayStartMinutes = convertToMinutes("08:00");
        const dayEndMinutes = convertToMinutes("16:00");

        if (startMinutes < dayStartMinutes || endMinutes > dayEndMinutes) {
            toast.warning(`Time should be between 08:00 and 16:00`, {
                position: "bottom-right",
                autoClose: 2000,
            });
            return;
        }

        // Validation: Start time must be before end time
        if (startMinutes >= endMinutes) {
            toast.warning(`Start time must be before end time`, {
                position: "bottom-right",
                autoClose: 2000,
            });
            return;
        }

        // Validation: Start time and end time should have a maximum of 1.5 hours gap
        const maxDurationMinutes = 1.5 * 60; // 1.5 hours in minutes
        const duration = endMinutes - startMinutes;

        if (duration > maxDurationMinutes) {
            toast.warning(`The time gap between start and end time should not exceed 1.5 hours`, {
                position: "bottom-right",
                autoClose: 2000,
            });
            return;
        }

        setButtonLoading(true);
        try {
            const token = await window.electronAPI.getUserData();
            formData.user = token.admin._id;

            const response = await axios.post(`${conf.backendUrl}timetable/add-timetable`, { formData },
                {
                    headers: {
                        Authorization: `Bearer ${token?.token}`,
                    },
                });

            toast.success(response.data.message, {
                position: "bottom-right",
                autoClose: 2000,
            });
            setFormDataBlank();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Error while adding Timetable", {
                position: "bottom-right",
                autoClose: 2000,
            });
        }
        setButtonLoading(false);
    };


    const handleSubjectChange = (subjectName) => {
        const selectedSubject = selectedSubData.find(sub => sub.name === subjectName);
        setFormData({
            ...formData,
            subject: subjectName,
            teacher: selectedSubject ? selectedSubject.teacher._id : '',
            grade: selectedSubject ? selectedSubject.grade : ''
        });
    };

    // get all time tables
    const getAllTimetables = async () => {
        try {
            const token = await window.electronAPI.getUserData();
            const id = token.admin._id
            const response = await axios.get(`${conf.backendUrl}timetable/get-all-timetables/${id}`, {
                headers: {
                    Authorization: `Bearer ${token?.token}`
                }
            });
            // setSubjectData(response?.data?.data.subjects);
            setAllTimetables(response?.data?.data?.timetables)
        } catch (err) {
            console.log("err: ", err);
        }
    };
    useEffect(() => {
        getAllTimetables();
    }, [])

    // sort timetable
    const sortedTimetables = allTimetables.sort((a, b) => {
        const gradeA = a.grade.toUpperCase();
        const gradeB = b.grade.toUpperCase();
        if (gradeA < gradeB) return -1;
        if (gradeA > gradeB) return 1;
        return 0;
    });

    // delete timeTable
    const deleteTimetable = async (id) => {
        setDeleteLoadingSub((prev) => ({ ...prev, [id]: true }));
        const token = await window.electronAPI.getUserData();
        await axios.delete(`${conf.backendUrl}timetable/delete-timetable/${id}`, {
            headers: {
                Authorization: `Bearer ${token?.token}`
            }
        }).then((response) => {
            toast.success(response?.data?.message, {
                position: "bottom-right",
                autoClose: 2000,
            });
            setDeleteLoadingSub((prev) => ({ ...prev, [id]: false }));
            getAllTimetables()
        }).catch((err) => {
            toast.error(`Check Your Network or Reload`, {
                position: "bottom-right",
                autoClose: 2000,
            });
            setDeleteLoadingSub((prev) => ({ ...prev, [id]: false }));
        })
    }

    const getAllGrades = async () => {
        const token = await window.electronAPI.getUserData();
        const user = token.admin._id

        try {
            await axios.get(`${conf.backendUrl}admin/get-all-grades/${user}`, {
                headers: {
                    Authorization: `Bearer ${token?.token}`,
                },
            }).then((res) => {
                setAllGrades(res.data?.data?.gradename)
            })
        } catch (err) {
            toast.error(`${err.response?.data?.message || "Network Issue"}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        }
    }

    useEffect(() => {
        getAllGrades()
    }, [])

    return (
        <section className=''>
            <ToastContainer />
            <div className="flex items-center justify-center py-10 w-full">
                <div className="min-w-96 w-full mx-auto">
                    <h2 className="text-center text-2xl font-bold leading-tight text-gray-700">
                        Add Timetable
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already added?{' '}
                        <Link
                            to="/home"
                            title=""
                            className="font-semibold text-gray-700 transition-all duration-200 hover:underline"
                        >
                            Goto Home?
                        </Link>
                    </p>
                    {/* Select Form  */}
                    <form className="mt-8 border-b-2 pb-16 w-full " onSubmit={handleGradeSubmit}>
                        <div className="space-y-5 w-2/3 mx-auto flex">
                            <div className='w-5/6 pr-2'>
                                <label htmlFor="grade" className="text-base font-medium text-gray-700">
                                    Select Grade
                                </label>
                                <div className="mt-2">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        id="grade"
                                        required
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}>
                                        <option value="" disabled>Select Grade</option>
                                        {allGrades?.map((grade) => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className='w-1/6 flex justify-end'>
                                <button
                                    type="submit"
                                    className="inline-flex w-44 mt-3 items-center h-10 justify-center rounded-md bg-black font-semibold leading-7 text-white hover:bg-black/80 py-0"
                                    disabled={gradeButtonLoading}>
                                    {gradeButtonLoading ? 'Please wait...' : 'Select'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Add timetable  */}
                    {selectedSubData.length ? (
                        <form className="mt-8 border-b-2 pb-16 w-full" onSubmit={handleSubmit}>
                            <div className="space-y-5 w-2/3 mx-auto">
                                <div>
                                    <label htmlFor="name" className="text-base font-medium text-gray-700">
                                        Grade
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                            type="text"
                                            placeholder="Subject Name"
                                            id="name"
                                            required
                                            value={selectedSubData[0]?.grade || 0}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="grade" className="text-base font-medium text-gray-700">
                                        Select Subject
                                    </label>
                                    <div className="mt-2">
                                        <select
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                            id="grade"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => handleSubjectChange(e.target.value)}
                                        >
                                            <option value="" disabled>Select Subject</option>
                                            {selectedSubData.map((sub) => (
                                                <option key={sub._id} value={sub.name}>{sub.name}</option>
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
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                            id="teacher"
                                            required
                                            value={formData.teacher}
                                            onChange={(e) => handleChange('teacher', e.target.value)}
                                        >
                                            <option value="">Select teacher</option>
                                            {selectedSubData.filter(sub => sub.name === formData.subject).map((sub) => (
                                                <option key={sub.teacher._id} value={sub.teacher._id}>{sub.teacher.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="start-time" className="text-base font-medium text-gray-700">
                                        Start Time
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                            type="time"
                                            id="start-time"
                                            required
                                            value={formData.startTime.split(' ')[0]} // Only set the time part
                                            onChange={(e) => handleChange('startTime', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="end-time" className="text-base font-medium text-gray-700">
                                        End Time
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                            type="time"
                                            id="end-time"
                                            required
                                            value={formData.endTime.split(' ')[0]} // Only set the time part
                                            onChange={(e) => handleChange('endTime', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='w-full flex justify-end'>
                                    <button
                                        type="submit"
                                        className="inline-flex w-44 items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                                        disabled={buttonLoading}>
                                        {buttonLoading ? 'Please wait...' : 'Add Timetable'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (null)}


                    {/* display all timetables  */}
                    <section className="mt-8 border-b-2 pb-16 w-2/3 mx-auto">
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-center text-2xl font-bold leading-tight text-gray-800">
                                    All Timetables
                                </h2>
                                <section className="mx-auto w-full max-w-7xl px-4 py-4">
                                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                                        <div>
                                            <h2 className="text-lg font-semibold">Timetables</h2>
                                            <p className="mt-1 text-sm text-gray-700">
                                                This is a list of all timetables. You can add new timetables and delete existing ones.
                                            </p>
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={getAllTimetables}
                                                className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                            >
                                                Refresh
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-col">
                                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                                <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th
                                                                    scope="col"
                                                                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-700"
                                                                >
                                                                    Grade Name
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-700"
                                                                >
                                                                    Teacher
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-700"
                                                                >
                                                                    Subject
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-700"
                                                                >
                                                                    Start Time
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-700"
                                                                >
                                                                    End Time
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-700"
                                                                >
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                            {sortedTimetables.map((timetable) => (
                                                                <tr key={timetable._id}>
                                                                    <td className="whitespace-nowrap px-4 py-4">
                                                                        <div className="text-sm font-medium text-gray-900">{timetable.grade}</div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap py-4">
                                                                        <div className="flex items-center">
                                                                            <div className="ml-4">
                                                                                <div className="text-sm font-medium text-gray-900">{timetable?.teacher?.name}</div>
                                                                                <div className="text-sm text-gray-700">{timetable?.teacher?.email}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-4 py-4">
                                                                        <div className="text-sm text-gray-900">
                                                                            <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                                                                                {timetable.subject}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-4 py-4">
                                                                        <div className="text-sm text-gray-900 font-mono">{timetable.startTime}</div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-4 py-4">
                                                                        <div className="text-sm text-gray-900 font-mono">{timetable.endTime}</div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                                                                        <button
                                                                            type="button"
                                                                            className="text-red-600 hover:text-red-900"
                                                                            onClick={() => deleteTimetable(timetable._id)}
                                                                            disabled={deleteLoadingSub[timetable._id]}
                                                                        >
                                                                            {deleteLoadingSub[timetable._id] ? 'Deleting...' : 'Delete'}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </section>
                </div >
            </div >
        </section >
    );
}

export default Subject;