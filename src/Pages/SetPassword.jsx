import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Star } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const SetPassword = ({ passwordId }) => {
    const navigate = useNavigate()
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                //setIsSubmitting(true);

                const response = await axios.patch(
                    "https://api.ozopool.in/users/set-password/",
                    {
                        password,
                        confirmPassword,
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                        params: { encryption: passwordId, } 
                    },
                );

                console.log("Password updated successfully!", response.data);
                navigate("/");

            } catch (error) {
                if (error.response) {
                    console.error("Server error:", error.response.data);
                } else if (error.request) {
                    console.error("No response received:", error.request);
                } else {
                    console.error("Request setup error:", error.message);
                }
            } 
            // finally {
            //     setIsSubmitting(false);
            // }
        }
    };


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-5 col-md-7 col-sm-9">
                        <div className="card border-1 rounded-1">
                            <div className="card-body p-5">
                                {/* Logo and Brand */}
                                <div className="text-center mb-4">
                                    <div className="d-flex align-items-center justify-content-center mb-3">
                                        <img src="/Faraday_ozone_logo.svg" width={170} className="text-center" alt="Faraday Ozone" />
                                    </div>
                                    <p className="text-muted mb-0">Set up your account password</p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit}>
                                    {/* Password Field */}
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label text-muted fw-medium">
                                            Password
                                        </label>
                                        <div className="position-relative">
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0" style={{ borderColor: '#e9ecef' }}>
                                                    <Lock size={20} className="text-muted" />
                                                </span>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className={`form-control border-start-0 ps-0 ${errors.password ? 'is-invalid' : ''}`}
                                                    id="password"
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    style={{
                                                        borderColor: '#e9ecef',
                                                        fontSize: '15px',
                                                        padding: '12px 16px'
                                                    }}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary border-start-0"
                                                    onClick={togglePasswordVisibility}
                                                    style={{ borderColor: '#e9ecef', backgroundColor: 'white' }}
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <div className="invalid-feedback d-block">
                                                    {errors.password}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="mb-4">
                                        <label htmlFor="confirmPassword" className="form-label text-muted fw-medium">
                                            Confirm Password
                                        </label>
                                        <div className="position-relative">
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0" style={{ borderColor: '#e9ecef' }}>
                                                    <Lock size={20} className="text-muted" />
                                                </span>
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    className={`form-control border-start-0 ps-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                    id="confirmPassword"
                                                    placeholder="Confirm your password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    style={{
                                                        borderColor: '#e9ecef',
                                                        fontSize: '15px',
                                                        padding: '12px 16px'
                                                    }}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary border-start-0"
                                                    onClick={toggleConfirmPasswordVisibility}
                                                    style={{ borderColor: '#e9ecef', backgroundColor: 'white' }}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <div className="invalid-feedback d-block">
                                                    {errors.confirmPassword}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="d-grid">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg fw-medium"
                                            style={{
                                                backgroundColor: '#007bff',
                                                borderColor: '#007bff',
                                                borderRadius: '8px',
                                                padding: '12px 24px',
                                                fontSize: '16px'
                                            }}
                                        >
                                            Create Account
                                        </button>
                                    </div>
                                </form>

                                {/* Additional Info */}
                                {/* <div className="text-center mt-4">
                  <p className="text-muted small mb-0">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-primary text-decoration-none">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary text-decoration-none">
                      Privacy Policy
                    </a>
                  </p>
                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
