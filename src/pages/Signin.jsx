import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import conf from '../conf/conf';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveDataToLocalStorage } from '../utils/localStorage';

function SignIn() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [buttonLoading, setButtonLoading] = useState(false);
    const navigate = useNavigate();


    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonLoading(true);
        console.log("URL: ", conf.backendUrl);

        await axios.post(`${conf.backendUrl}admin/login-admin`, formData)
            .then((response) => {
                const { token, admin } = response.data.data;

                saveDataToLocalStorage("token", token);
                saveDataToLocalStorage("admin", JSON.stringify(admin));
                console.log(response.data?.data)
                console.log("Json: ", JSON.stringify(admin))

                navigate("/home");
                setButtonLoading(false);
            })
            .catch((err) => {
                if (err?.response?.data?.message === undefined) {
                    toast.error(err.message, {
                        position: "bottom-right",
                        autoClose: 2000,
                    });
                }
                else {
                    toast.error(`${err?.response?.data?.message} `, {
                        position: "bottom-right",
                        autoClose: 2000,
                    });
                }

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
                        Login to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Don <span></span>t have an account?{' '}
                        <Link
                            to="/signup"
                            title=""
                            className="font-semibold text-black transition-all duration-200 hover:underline"
                        >
                            Create Account
                        </Link>
                    </p>
                    <form className="mt-8" onSubmit={handleSubmit}>
                        <div className="space-y-5">
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
                                        list="emailSuggestions"
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
                                <button
                                    type="submit"
                                    className="inline-flex w-full items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                                    disabled={buttonLoading}
                                >
                                    {buttonLoading ? ' wait...' : 'Login'} <ArrowRight className="ml-2" size={16} />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default SignIn;
