import { useState, useEffect, useRef } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { BiLogOutCircle } from "react-icons/bi";
import { Link } from 'react-router-dom';
import "./Navbar.css";

const MyNavbar = () => {
    const [expanded, setExpanded] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [role, setRole] = useState(true)
    const navbarRef = useRef(null);

    useEffect(() => {
        const role = localStorage.getItem("Customer Type")
        if (role === "End Customer"){
            setRole(false)
            console.log("End");
            
        }
        else {
            setRole(true)
            console.log("no");
        }
    },[])

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target) && expanded) {
                setExpanded(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [expanded]);

    // Close navbar when menu item is clicked in mobile view
    const handleNavItemClick = () => {
        // Bootstrap's 'lg' breakpoint is 992px, matching your condition
        if (window.innerWidth < 992) {
            setExpanded(false);
        }
    };

    return (
        <>
            <Navbar
                ref={navbarRef}
                expand="lg"
                expanded={expanded}
                className={`modern-navbar ${scrolled ? "scrolled" : ""} m-0 p-0`}
                fixed="top"
            >
                <div className="container-fluid">
                    <Navbar.Brand as={Link} to="/users" className="brand">
                        <div className="d-flex align-items-center">
                            <img
                                src="/Faraday_ozone_logo.svg"
                                alt="Faraday Ozone Logo"
                                style={{ width: "55px", height: "55px", objectFit: "contain" }}
                                className="me-2"
                            />
                            <div>
                                <p className="m-0 p-0 fw-bold fs-12">Faraday Ozone</p>
                            </div>
                        </div>
                    </Navbar.Brand>

                    <div className="d-flex align-items-center">
                        {/* Login button visible only on small screens (hidden on lg and up) */}
                        <div className="login-button-container d-lg-none">
                            <p className='text-danger m-0 p-0 ms-lg-3 px-4' onClick={() => {
                                localStorage.clear()
                                window.location.href = '/login'
                            }}>
                                <BiLogOutCircle className="fs-4" />
                            </p>
                        </div>

                        <Navbar.Toggle
                            aria-controls="basic-navbar-nav"
                            onClick={() => setExpanded(!expanded)}
                            className="custom-toggler"
                        >
                            <div className={`hamburger ${expanded ? "active" : ""}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </Navbar.Toggle>
                    </div>

                    <Navbar.Collapse id="basic-navbar-nav" className="navbar-collapse">
                        <Nav className="mx-auto">
                            <Link to="/device" onClick={handleNavItemClick} className="nav-link">
                                Device
                            </Link>
                            {
                                role &&
                                <>
                                    <Link to="/organization" onClick={handleNavItemClick} className="nav-link">
                                        Organization
                                    </Link>
                                </>
                            }
                                    <Link to="/users" onClick={handleNavItemClick} className="nav-link">
                                        Users
                                    </Link>
                        </Nav>

                        <div className="d-none d-lg-block">
                            <p className='text-danger m-0 p-0 ms-lg-3 px-4' onClick={() => {
                                localStorage.clear()
                                window.location.href = '/login'
                            }}>
                                <BiLogOutCircle className="fs-4" />
                            </p>
                        </div>
                    </Navbar.Collapse>
                </div>
            </Navbar>
        </>
    );
};

export default MyNavbar;