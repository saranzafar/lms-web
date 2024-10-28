import React, { useEffect, useState } from 'react';
import { CircleUserRoundIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import conf from "../../conf/conf";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FeeReport() {
    const [fetchedStudents, setFetchedStudents] = useState([]);
    const [grade, setGrade] = useState("");
    const [gradeButtonLoading, setGradeButtonLoading] = useState(false);
    const [submitFeeButtonLoading, setSubmitFeeButtonLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [secondFetchedStudents, setSecondFetchedStudents] = useState([]);
    const [secondGrade, setSecondGrade] = useState("");
    const [secondGradeButtonLoading, setSecondGradeButtonLoading] = useState(false);
    const [Year, setYear] = useState({ min: '', max: '' });
    const [fees, setFees] = useState([]);
    const [allGrades, setAllGrades] = useState([]);

    // Handle form data changes
    const handleInputChange = (e, rollNo, field) => {
        const value = e.target.value;
        setFormData(prevState => ({
            ...prevState,
            [rollNo]: {
                ...prevState[rollNo],
                [field]: value
            }
        }));
    };

    // Handle fee submission for a student
    const handleFeeSubmit = async (rollNo, studentId) => {
        // setSubmitFeeButtonLoading(true);
        const data = formData[rollNo];
        const token = await window.electronAPI.getUserData();
        const { admin: { _id: userId } } = token;

        const payload = {
            user: userId,
            date: data.date,
            grade,
            student: studentId,
            amount: data.amount,
        };

        try {
            await axios.post(`${conf.backendUrl}fee-report/add-fee`, payload, {
                headers: {
                    Authorization: `Bearer ${token?.token}`,
                },
            });
            setFormData({})
            toast.success(`Fee submitted for Rollno: ${rollNo}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        } catch (err) {
            toast.error(`${err.response?.data?.message}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        }
        // finally {
        //     setSubmitFeeButtonLoading(false)
        // }
    };

    // Handle grade submission to fetch students
    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        setGradeButtonLoading(true);
        const token = await window.electronAPI.getUserData();
        const { admin: { _id: userId } } = token;
        await axios.post(`${conf.backendUrl}fee-report/get-students-by-grade`, { grade, user: userId },
            {
                headers: {
                    Authorization: `Bearer ${token?.token}`,
                },
            })
            .then((response) => {
                setFetchedStudents(response?.data?.data?.students)
            })
            .catch((err) => {
                toast.error(`${err?.response?.data?.message}`, {
                    position: "bottom-right",
                    autoClose: 2000,
                });
            }).finally(() => {
                setGradeButtonLoading(false);
            })
    };

    // Handle grade submission to fetch students with fee records
    const handlesecondGradeSubmit = async (e) => {
        e.preventDefault();
        setSecondGradeButtonLoading(true);
        const token = await window.electronAPI.getUserData();
        const { admin: { _id: userId } } = token;
        await axios.post(`${conf.backendUrl}fee-report/get-student-with-info`, { grade: secondGrade, user: userId },
            {
                headers: {
                    Authorization: `Bearer ${token?.token}`,
                },
            })
            .then((response) => {
                setSecondFetchedStudents(response?.data?.data?.students)
                setFees(response?.data?.data?.fees)
                setYear({
                    min: response?.data?.data?.minYear,
                    max: response?.data?.data?.maxYear,
                });
            })
            .catch((err) => {
                toast.error(`${err?.response?.data?.message}`, {
                    position: "bottom-right",
                    autoClose: 2000,
                });
            }).finally(() => {
                setSecondGradeButtonLoading(false);
            })
    };

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
                        Fee Report
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

                    {/* Select Grade */}
                    <form className="mt-8 pb-16 w-full " onSubmit={handleGradeSubmit}>
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

                    {/* Add Fee */}
                    {fetchedStudents.length ? (
                        <div className="overflow-x-auto mt-8">
                            <h1 className=' text-xl mx-auto text-center mb-6 font-semibold'>Enter Fee of Student</h1>
                            <table className="w-11/12 mx-auto bg-white border border-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fetchedStudents.map(student => (
                                        <tr key={student.rollNo}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name} {student.fatherName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <input
                                                    type="date"
                                                    value={formData[student.rollNo]?.date || ""}
                                                    onChange={(e) => handleInputChange(e, student.rollNo, 'date')}
                                                    className="border-gray-300 border-b p-2"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <input
                                                    type="number"
                                                    placeholder='Fee amount'
                                                    value={formData[student.rollNo]?.amount || ""}
                                                    onChange={(e) => handleInputChange(e, student.rollNo, 'amount')}
                                                    className="border-gray-300 border-b p-2"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleFeeSubmit(student.rollNo, student._id)}
                                                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900"
                                                >
                                                    {submitFeeButtonLoading ? "Adding" : "Submit Fee"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null}

                    {/* View Fee Report */}
                    <form className="mt-12 pb-16 w-full " onSubmit={handlesecondGradeSubmit}>
                        <div className="space-y-5 w-2/3 mx-auto flex">
                            <div className='w-5/6 pr-2'>
                                <label htmlFor="grade" className="text-base font-medium text-gray-700">
                                    View Report
                                </label>
                                <div className="mt-2">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        id="grade"
                                        required
                                        value={secondGrade}
                                        onChange={(e) => setSecondGrade(e.target.value)}>
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
                                    disabled={secondGradeButtonLoading}>
                                    {secondGradeButtonLoading ? 'Please wait...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Display Fee Records */}
                    {secondFetchedStudents.length && Year.min && Year.max ? (
                        <div className="overflow-x-auto mt-8">
                            <div className='flex items-center w-full'>
                                <h1 className=' text-xl mx-auto text-center mb-6 font-semibold'>Fee Report</h1>
                                <div className="mx-auto flex items-center gap-x-4">
                                    <div className="mt-2 border-b font-semibold">
                                        {/* <select
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                            id="year"
                                            required
                                            value={Year?.max || ""}
                                            onChange={(e) => setYear({ ...Year, min: e.target.value })}>
                                            <option value="" disabled>Select Year</option>
                                            {Array.from({ length: Year.max - Year.min + 1 }, (_, i) => Year.min + i).map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select> */}
                                        {Year.max}
                                    </div>
                                    <button
                                        onClick={handlesecondGradeSubmit}
                                        className="font-medium text-white px-6 py-2 rounded bg-black"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            <table className="w-11/12 mx-auto bg-white border border-gray-200 mt-6">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <th key={i} className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{new Date(0, i).toLocaleString('default', { month: 'short' })}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {secondFetchedStudents.map(student => {
                                        const studentFees = fees.filter(fee => fee.student === student._id);
                                        const feeMap = studentFees.reduce((acc, fee) => {
                                            const month = new Date(fee.date).getMonth();
                                            acc[month] = fee.amount;
                                            return acc;
                                        }, {});

                                        return (
                                            <tr key={student.rollNo}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name} {student.fatherName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNo}</td>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {feeMap[i] ? feeMap[i] : '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) :
                        (null)}
                </div>
            </div>
        </section>
    );
}

export default FeeReport;
