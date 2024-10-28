import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import conf from "../../conf/conf";
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
import { getDataFromLocalStorage } from '../../utils/localStorage';

function Home() {
    const [adminData, setAdminData] = useState({
        name: "",
        logo: "https://via.placeholder.com/150",
    });
    const [states, setStates] = useState({ numberOfStudents: "", numberOfSubjects: '', numberOfTeachers: '' });
    const [date, setDate] = useState(new Date());
    const logoUrl = adminData?.logo?.replace('http://', 'https://');
    const [announcement, setAnnouncement] = useState("");
    const [announcementBtnLoading, setAnnouncementBtnLoading] = useState(false);
    const [gradename, setGradename] = useState("");
    const [buttonLoading, setButtonLoading] = useState(false);
    const [gettingAllGrades, setGettingAllGrades] = useState(false);
    const [allGrades, setAllGrades] = useState([]);
    const [deleteLoading, setDeleteLoading] = useState({});
    const [tokenData, setTokenData] = useState({ token: "", admin: {} });

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

    const fetchHomeState = async () => {
        const token = tokenData.token;
        const user = tokenData.admin._id;

        try {
            const res = await axios.post(`${conf.backendUrl}admin/home-state`, { user }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStates(res.data.data);
        } catch (err) {
            toast.error(`${err.response?.data?.message || "Network Issue"}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        }
    };

    useEffect(() => { fetchHomeState(); }, [tokenData]);

    const getAllGrades = async () => {
        setGettingAllGrades(true);
        const token = tokenData.token;
        const user = tokenData.admin._id;

        try {
            const res = await axios.get(`${conf.backendUrl}admin/get-all-grades/${user}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllGrades(res.data?.data?.gradename);
        } catch (err) {
            toast.error(`${err.response?.data?.message || "Network Issue"}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        } finally {
            setGettingAllGrades(false);
        }
    };

    useEffect(() => { getAllGrades(); }, [tokenData]);

    const addAnnouncement = async (e) => {
        e.preventDefault();
        setAnnouncementBtnLoading(true);
        const token = tokenData.token;
        const user = tokenData.admin._id;

        try {
            const response = await axios.post(`${conf.backendUrl}admin/add-announcement`, { user, announcement }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(`${response.data?.message}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
            setAnnouncement("");
        } catch (err) {
            toast.error(`${err.response?.data?.message || "Network Issue"}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        } finally {
            setAnnouncementBtnLoading(false);
        }
    };

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        setButtonLoading(true);
        const token = tokenData.token;
        const user = tokenData.admin._id;

        try {
            const response = await axios.post(`${conf.backendUrl}admin/add-grade-name`, { user, gradename }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(`${response.data?.message}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
            setGradename("");
        } catch (err) {
            toast.error(`${err.response?.data?.message || "Network Issue"}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        } finally {
            setButtonLoading(false);
        }
    };

    const deleteGrade = async (grade) => {
        const token = tokenData.token;
        const user = tokenData.admin._id;

        setDeleteLoading((prev) => ({ ...prev, [grade]: true }));

        try {
            const response = await axios.delete(
                `${conf.backendUrl}admin/delete-grade`,
                {
                    data: { user, gradename: grade },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success(`${response.data?.message}`, {
                position: "bottom-right",
                autoClose: 2000,
            });
            setAllGrades((prev) => prev.filter((g) => g !== grade));
        } catch (error) {
            console.error('Error deleting grade:', error);
        } finally {
            setDeleteLoading((prev) => ({ ...prev, [grade]: false }));
        }
    };

    return (
        <div className='ml-8'>
            <ToastContainer />
            {/* Header with school name and logo */}
            <div className='flex justify-between border-b overflow-y-hidden'>
                <div>
                    <h1 className="text-6xl font-bold text-black">{tokenData.admin.name}</h1>
                    <p className="mt-2 text-gray-800">Education For all</p>
                </div>
                <div className="flex gap-2 w-32">
                    <img className='rounded-full' src={tokenData?.admin?.logo} alt="Logo" />
                </div>
            </div>

            {/* Announcement Section */}
            <form className="mt-6" onSubmit={addAnnouncement}>
                <div className="mt-2">
                    <textarea
                        id="about"
                        name="about"
                        rows={5}
                        placeholder='Write an announcement'
                        value={announcement}
                        required
                        onChange={(e) => setAnnouncement(e.target.value)}
                        className="block w-[80%] mx-auto rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-gray-800 p-2"
                    />
                </div>
                <button
                    type="submit"
                    disabled={announcementBtnLoading}
                    className="font-medium text-white px-6 py-2 rounded bg-black ml-[84%] mt-4"
                >
                    {announcementBtnLoading ? "Adding..." : "Add"}
                </button>
            </form>

            {/* Statistics Section */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-200 text-black p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold">Students</h2>
                    <p className="mt-2 text-4xl text-gray-600">{states.numberOfStudents}</p>
                </div>
                <div className="bg-gray-200 text-black p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold">Teachers</h2>
                    <p className="mt-2 text-4xl text-gray-600">{states.numberOfTeachers}</p>
                </div>
                <div className="bg-gray-200 text-black p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold">Subjects</h2>
                    <p className="mt-2 text-4xl text-gray-600">{states.numberOfSubjects}</p>
                </div>
            </div>

            {/* add grade */}
            <form className="mt-8 border-t-2 pt-10  pb-16 w-full " onSubmit={handleGradeSubmission}>
                <div className="space-y-5 w-2/3 mx-auto flex">
                    <div className='w-5/6 pr-2'>
                        <label htmlFor="grade" className="text-base font-medium text-gray-700">
                            Add grade
                        </label>
                        <div className="mt-2">
                            <input
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                id="grade"
                                placeholder='Enter grade name'
                                required
                                value={gradename}
                                onChange={(e) => setGradename(e.target.value)}>
                            </input>
                        </div>
                    </div>
                    <div className='w-1/6 flex justify-end'>
                        <button
                            type="submit"
                            className="inline-flex w-44 mt-3 items-center h-10 justify-center rounded-md bg-black font-semibold leading-7 text-white hover:bg-black/80 py-0"
                            disabled={buttonLoading}>
                            {buttonLoading ? 'Please wait...' : 'Add Grade'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Calendar and all grades Section */}
            <div className='flex justify-center items-center gap-x-4 w-full'>

                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-12 text-black text-center ">Upcoming Events</h2>
                    <Calendar
                        onChange={setDate}
                        value={date}
                        tileClassName={({ date }) =>
                            adminData?.importantDates?.find(d => d === date.toISOString().split('T')[0])
                                ? 'highlight'
                                : null
                        }
                    />
                </div>

                <div className="mt-12 w-[50%] ">
                    <div className='flex justify-around'>
                        <h2 className="text-2xl font-bold text-black text-center">Available Grades</h2>
                        <div
                            className={`cursor-pointer text-gray-800 hover:text-gray-600 text-center ${gettingAllGrades ? "animate-spin" : ""}`}
                            onClick={getAllGrades}
                        ><RefreshCw className='' /></div>
                    </div>
                    {/* Display all Grades */}
                    <section className="mt-8 border-b-2 pb-16 w-2/3 mx-auto h-[20rem] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {allGrades?.map((grade, index) => (
                                    <tr key={index}>
                                        <td className="whitespace-nowrap px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">{grade}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                                            <button
                                                type="button"
                                                className="text-red-600 hover:text-red-900"
                                                onClick={() => deleteGrade(grade)}
                                                disabled={deleteLoading[grade]} // Disable button while deleting
                                            >
                                                {deleteLoading[grade] ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </div >
    );
}

export default Home;