import { useState } from "react";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  // login 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const loginResponse = await axios.post(
        "https://api.ozopool.in/users/login/",
        formData,
        {
          headers: { "Content-Type": "application/json" },
          //withCredentials: true,
        }
      );
      localStorage.setItem("access_token", loginResponse.data.accessToken);
      localStorage.setItem("Customer Type", loginResponse.data.customerType);
      localStorage.setItem("User Role", loginResponse.data.userRole);
      localStorage.setItem("User Id", loginResponse.data.userId);
      localStorage.setItem("email", formData.email);
      localStorage.setItem("timestamp", new Date().getTime());
      navigate("/users");
    } catch (error) {
      console.log("my error data", error.response.data);
      console.log("my error data error", error.response.data.error);
      // if (error.response) {
      //   console.error("Error status:", error.response.status);
      //   console.error("Error message:", error.response.data);
      // } else if (error.request) {
      //   console.error("No response received:", error.request);
      // } else {
      //   console.error("Error setting up request:", error.message);
      // }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Container>
        <Row className="justify-content-center min-vh-100 align-items-center text-dark">
          <Col md={8} lg={6} xl={5}>
            <div className="auth-card mt-5 border p-5 p-md-5 rounded ">
              <div className="card-header text-center">
                <Link to={"/"} className="text-center">
                  <img src="/Faraday_ozone_logo.svg" width={170} className="text-center" alt="Faraday Ozone" />
                </Link>
                {/* <h4 className="mb-0 fw-bold my-4">Login</h4> */}
                <p className="text-muted my-2">Sign in to your account</p>
              </div>

              <div className="card-body">
                <Form onSubmit={handleSubmit} >
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaEnvelope />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Label>Password</Form.Label>
                    </div>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={togglePasswordVisibility}
                        className="toggle-password"
                        type="button"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 mb-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};