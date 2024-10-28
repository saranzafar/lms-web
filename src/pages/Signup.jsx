import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import conf from '../conf/conf';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import appIcon from '../assets/icon.png';

function SignUp() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', location: '', logo: null });
    const [buttonLoading, setButtonLoading] = useState(false);
    const navigate = useNavigate();


    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, logo: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('location', formData.location);
        if (formData.logo) {
            formDataToSend.append('logoImage', formData.logo);
        }

        await axios.post(`${conf.backendUrl}admin/register-admin`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then((response) => {
                navigate("/"); // redirection
                setButtonLoading(false);
            })
            .catch((err) => {
                err?.response?.data?.message === undefined ? toast.error(err.message, {
                    position: "bottom-right",
                    autoClose: 2000,
                }) :
                    toast.error(`${err?.response?.data?.message} `, {
                        position: "bottom-right",
                        autoClose: 2000,
                    })

                setButtonLoading(false);
            });
    };

    return (
        <section>
            <ToastContainer />
            <div className="flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24 w-full">
                <div className="min-w-96">
                    <div className="mb-2 flex justify-center">
                        {/* <img className='w-32' src={appIcon} alt="App Icon" /> */}
                    </div>
                    <h2 className="text-center text-2xl font-bold leading-tight text-black">
                        Sign up for an account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/"
                            title=""
                            className="font-semibold text-black transition-all duration-200 hover:underline"
                        >
                            Login
                        </Link>
                    </p>
                    <form className="mt-8" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="name" className="text-base font-medium text-gray-900">
                                    School Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        type="text"
                                        placeholder="School Name"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="text-base font-medium text-gray-900">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        type="email"
                                        placeholder="Email"
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-base font-medium text-gray-900">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        className="text-sm font-semibold text-black hover:underline"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {passwordVisible ? 'Hide' : 'Show'} password
                                    </button>
                                </div>
                                <div className="mt-2 relative">
                                    <input
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        type={passwordVisible ? 'text' : 'password'}
                                        placeholder="Password"
                                        id="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="location" className="text-base font-medium text-gray-900">
                                    Location
                                </label>
                                <div className="mt-2">
                                    <input
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        type="text"
                                        placeholder="Location"
                                        id="location"
                                        required
                                        value={formData.location}
                                        onChange={(e) => handleChange('location', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="logo" className="text-base font-medium text-gray-900">
                                    Your Logo
                                </label>
                                <div className="mt-2">
                                    <input
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        type='file'
                                        accept="image/*"
                                        id="logo"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="inline-flex w-full items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                                    disabled={buttonLoading}
                                >
                                    {buttonLoading ? 'Creating account...' : 'Create account'} <ArrowRight className="ml-2" size={16} />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default SignUp;
