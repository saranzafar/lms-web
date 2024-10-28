import React, { useEffect, useState } from 'react';
import { CircleUserRoundIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import conf from "../../conf/conf";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getDataFromLocalStorage } from '../../utils/localStorage';

function Subject() {
    const [formData, setFormData] = useState({ name: '', teacher: '', grade: '', user: '' });
    const [teacherData, setTeacherData] = useState([]);
    const [subjectData, setSubjectData] = useState([]);
    const [allGrades, setAllGrades] = useState([]);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [deleteLoadingSub, setDeleteLoadingSub] = useState({});
    const [tokenData, setTokenData] = useState({ token: "", admin: {} });
    const sortedSubjectData = subjectData.sort((a, b) => {
        const gradeA = a.grade.toUpperCase();
        const gradeB = b.grade.toUpperCase();
        return gradeA.localeCompare(gradeB);
    });

    useEffect(() => {
        const retrievedUserData = getDataFromLocalStorage("admin");
        const retrievedToken = getDataFromLocalStorage("token");

        if (retrievedUserData || retrievedToken) {
            const adminData = JSON.parse(retrievedUserData);
            setTokenData({
                token: retrievedToken,
                admin: adminData,
            });
        }
    }, []);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const setFormDataBlank = () => {
        setFormData({ name: '', teacher: '', grade: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonLoading(true);

        try {
            await axios.post(`${conf.backendUrl}subject/add-subject`,
                { ...formData, user: tokenData.admin._id },
                { headers: { Authorization: `Bearer ${tokenData.token}` } }
            );
            toast.success("Subject added successfully.", { position: "bottom-right", autoClose: 2000 });
            setFormDataBlank();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error adding subject.", { position: "bottom-right", autoClose: 2000 });
        } finally {
            setButtonLoading(false);
        }
    };

    const getAllTeachers = async () => {
        try {
            const response = await axios.post(`${conf.backendUrl}teacher/get-all-teachers`,
                { id: tokenData.admin._id },
                { headers: { Authorization: `Bearer ${tokenData.token}` } }
            );
            setTeacherData(response.data.data.teachers);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error fetching teachers.", { position: "bottom-right", autoClose: 2000 });
            setTeacherData([]);
        }
    };

    useEffect(() => { getAllTeachers(); }, [tokenData]);

    const getAllSubjects = async () => {
        try {
            const response = await axios.post(`${conf.backendUrl}subject/get-all-subjects`,
                { id: tokenData.admin._id },
                { headers: { Authorization: `Bearer ${tokenData.token}` } }
            );
            setSubjectData(response.data.data.subjects);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error fetching subjects.", { position: "bottom-right", autoClose: 2000 });
            setSubjectData([]);
        }
    };

    useEffect(() => { getAllSubjects(); }, [tokenData]);

    const deleteSubject = async (id) => {
        setDeleteLoadingSub((prev) => ({ ...prev, [id]: true }));

        try {
            await axios.delete(`${conf.backendUrl}subject/delete-subject/${id}`,
                { headers: { Authorization: `Bearer ${tokenData.token}` } }
            );
            getAllSubjects();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error deleting subject.", { position: "bottom-right", autoClose: 2000 });
        } finally {
            setDeleteLoadingSub((prev) => ({ ...prev, [id]: false }));
        }
    };

    const getAllGrades = async () => {
        try {
            const response = await axios.get(`${conf.backendUrl}admin/get-all-grades/${tokenData.admin._id}`,
                { headers: { Authorization: `Bearer ${tokenData.token}` } }
            );
            setAllGrades(response.data.data.gradename);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error fetching grades.", { position: "bottom-right", autoClose: 2000 });
        }
    };

    useEffect(() => { getAllGrades(); }, [tokenData]);
    return (
        <section>
            <ToastContainer />
            <div className="flex items-center justify-center py-10 w-full">
                <div className="min-w-96 w-full mx-auto">
                    <h2 className="text-center text-2xl font-bold leading-tight text-gray-700">
                        Add Subject
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already added?{' '}
                        <Link
                            to="/home/timetable"
                            title=""
                            className="font-semibold text-gray-700 transition-all duration-200 hover:underline"
                        >
                            Goto Timetable
                        </Link>
                    </p>
                    {/* Form  */}
                    <form className="mt-8 border-b-2 pb-16 w-full " onSubmit={handleSubmit}>
                        <div className="space-y-5 w-2/3 mx-auto">
                            <div>
                                <label htmlFor="name" className="text-base font-medium text-gray-700">
                                    Subject Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        type="text"
                                        placeholder="Subject Name"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="grade" className="text-base font-medium text-gray-700">
                                    Grade
                                </label>
                                <div className="mt-2">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        id="grade"
                                        required
                                        value={formData.grade}
                                        onChange={(e) => handleChange('grade', e.target.value)}
                                    >
                                        <option value="" disabled>Select Grade</option>
                                        {allGrades?.map((grade) => (
                                            <option key={grade} value={grade}>{grade}</option>
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
                                        value={formData.gender}
                                        onChange={(e) => handleChange('teacher', e.target.value)}
                                    >
                                        <option value="">Select teacher</option>
                                        {teacherData.length > 0 && teacherData.map((teacher) => (
                                            <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className='w-full flex justify-end'>
                                <button
                                    type="submit"
                                    className="inline-flex w-44 items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                                    disabled={buttonLoading}>
                                    {buttonLoading ? 'Please wait...' : 'Add Subject'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* all subjects  */}
                    <form className="mt-8 border-b-2 pb-16 w-2/3 mx-auto" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-center text-2xl font-bold leading-tight text-gray-800">
                                    All Subjects
                                </h2>


                                {/* all subjects  */}
                                <section className="mx-auto w-full max-w-7xl px-4 py-4">
                                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                                        <div>
                                            <h2 className="text-lg font-semibold">Subjects</h2>
                                            <p className="mt-1 text-sm text-gray-700">
                                                This is a list of all subjects. You can add new subjects and delete existing ones.
                                            </p>
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={getAllSubjects}
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
                                                        <thead className="bg-gray-50 w-full">
                                                            <tr className=''>
                                                                <th
                                                                    scope="col"
                                                                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-700"
                                                                >
                                                                    <span>Instructure</span>
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-12 py-3.5 text-left text-sm font-normal text-gray-700"
                                                                >
                                                                    Contact
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
                                                                    Class
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-4 py-3.5 text-left text-sm font-normal text-gray-700"
                                                                ></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                            {subjectData?.map((subject) => (
                                                                <tr key={subject._id}>
                                                                    <td className="whitespace-nowrap px-4 py-4">
                                                                        <div className="flex items-center">
                                                                            <div className="">
                                                                                <CircleUserRoundIcon size={26} strokeWidth={1.3} />
                                                                            </div>
                                                                            <div className="ml-4">
                                                                                <div className="text-sm font-medium text-gray-900">{subject.teacher?.name}</div>
                                                                                <div className="text-sm text-gray-700">{subject.teacher?.address}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-12 py-4">
                                                                        <div className="text-sm text-gray-900 ">{subject.teacher?.email}</div>
                                                                        <div className="text-sm text-gray-700">{subject.teacher?.phoneNumber}</div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-4 py-4">
                                                                        <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                                                                            {subject.name}
                                                                        </span>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-2 py-4 font-semibold">
                                                                        <div className="text-sm text-gray-900 ">{subject.grade}</div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                                                                        <button
                                                                            type="button"
                                                                            className="text-red-600 hover:text-red-900"
                                                                            onClick={() => deleteSubject(subject._id)}
                                                                            disabled={deleteLoadingSub[subject._id]}
                                                                        >
                                                                            {deleteLoadingSub[subject._id] ? 'Deleting...' : 'Delete'}
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
                    </form>
                </div >
            </div >
        </section >
    );
}

export default Subject;