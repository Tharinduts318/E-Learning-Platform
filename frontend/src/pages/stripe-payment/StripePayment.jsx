import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate, useParams } from 'react-router-dom';
import { server } from '../../main';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserData } from '../../context/UserContext';
import { CourseData } from '../../context/CourseContext';
import Loading from '../../components/loading/Loading';
import './stripePayment.css';

// Load Stripe with publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Test mode indicator
const isTestMode = !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY; // Automatically detect test mode

const CourseDetails = ({ course }) => (
  <div className="form-section">
    <h3>Course Details</h3>
    <div className="course-summary">
      <img src={`${server}/${course.image}`} alt={course.title} className="course-thumbnail" />
      <div className="course-info">
        <h4>{course.title}</h4>
        <p>{course.description}</p>
        <div className="course-meta">
          <span>
            <strong>By:</strong> {course.createdBy}
          </span>
          <span>
            <strong>Duration:</strong> {course.duration}
          </span>
        </div>
        <div className="price">${course.price}</div>
      </div>
    </div>
  </div>
);

const TestCheckoutForm = ({ course, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, fetchUser } = UserData();
  const { fetchCourses, fetchMyCourse } = CourseData();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!course || !course.id) {
      setError('Course information is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const token = localStorage.getItem("token");
      console.log('Creating payment intent for course:', course);
      const { data: paymentData } = await axios.post(
        `${server}/api/stripe/create-payment-intent/${course.id}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
        }
      );

      if (!paymentData.success) {
        throw new Error(paymentData.message || 'Failed to create payment intent');
      }

      // Get payment intent details from the response
      const paymentIntent = {
        id: paymentData.clientSecret.split('_secret_')[0],
        status: 'requires_confirmation'
      };

      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name,
            email: user.email
          }
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (confirmedIntent.status === 'succeeded') {
        // Confirm payment on backend
        const { data: confirmData } = await axios.post(
          `${server}/api/stripe/confirm-payment`,
          {
            paymentIntentId: confirmedIntent.id,
            courseId: course.id
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'token': token
            },
          }
        );

        if (confirmData.success) {
          await fetchUser();
          await fetchCourses();
          await fetchMyCourse();
          toast.success('Payment successful! Course purchased.');
          onSuccess(confirmedIntent.id);
        } else {
          throw new Error(confirmData.message || 'Payment confirmation failed');
        }
      } else {
        throw new Error('Payment was not successful. Please try again.')
      }
    } catch (error) {
      console.error('Payment Error:', error);
      setError(error.response?.data?.message || error.message || 'Payment failed');
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <CourseDetails course={course} />

      <div className="form-section">
        <h3>Payment Information</h3>
        <div className="card-element-container">
          <div className="test-card-input">
            <div className="test-card-info">
              <p>🧪 <strong>Test Mode</strong> - Use any card details below:</p>
              <div className="test-card-example">
                <p><strong>Test Card:</strong> 4242 4242 4242 4242</p>
                <p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
                <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
              </div>
            </div>
            <div className="test-card-fields">
              <input 
                type="text" 
                placeholder="Card Number (4242 4242 4242 4242)" 
                className="test-input"
                defaultValue="4242 4242 4242 4242"
              />
              <div className="test-card-row">
                <input 
                  type="text" 
                  placeholder="MM/YY (12/25)" 
                  className="test-input"
                  defaultValue="12/25"
                />
                <input 
                  type="text" 
                  placeholder="CVC (123)" 
                  className="test-input"
                  defaultValue="123"
                />
              </div>
            </div>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="form-section">
        <h3>Order Summary</h3>
        <div className="order-summary">
          <div className="summary-row">
            <span>Course Price:</span>
            <span>${course.price}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${course.price}</span>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        className="pay-button"
      >
        {loading ? (
          <span className="loading-spinner">
            <div className="spinner"></div>
            Processing...
          </span>
        ) : (
          `Pay $${course.price}`
        )}
      </button>
    </form>
  );
};

const CheckoutForm = ({ course, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, fetchUser } = UserData();
  const { fetchCourses, fetchMyCourse } = CourseData();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    if (!course || !course.id) {
      setError('Course information is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const token = localStorage.getItem("token");
      console.log('Creating payment intent for course:', course);
      const { data: paymentData } = await axios.post(
        `${server}/api/stripe/create-payment-intent/${course.id}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
        }
      );

      if (!paymentData.success) {
        throw new Error(paymentData.message || 'Failed to create payment intent');
      }

      // Real Stripe payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: user?.name || '',
              email: user?.email || '',
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const { data: confirmData } = await axios.post(
          `${server}/api/stripe/confirm-payment`,
          {
            paymentIntentId: paymentIntent.id,
            courseId: course.id
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'token': token
            },
          }
        );

        if (confirmData.success) {
          await fetchUser();
          await fetchCourses();
          await fetchMyCourse();
          toast.success('Payment successful! Course purchased.');
          onSuccess(paymentIntent.id);
        } else {
          throw new Error(confirmData.message || 'Payment confirmation failed');
        }
      }
    } catch (error) {
      console.error('Payment Error:', error);
      setError(error.response?.data?.message || error.message || 'Payment failed');
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <CourseDetails course={course} />

      <div className="form-section">
        <h3>Payment Information</h3>
        <div className="card-element-container">
          <CardElement options={cardElementOptions} />
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="form-section">
        <h3>Order Summary</h3>
        <div className="order-summary">
          <div className="summary-row">
            <span>Course Price:</span>
            <span>${course.price}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${course.price}</span>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={!stripe || loading} 
        className="pay-button"
      >
        {loading ? (
          <span className="loading-spinner">
            <div className="spinner"></div>
            Processing...
          </span>
        ) : (
          `Pay $${course.price}`
        )}
      </button>
    </form>
  );
};

const StripePayment = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const params = useParams();
  const { user } = UserData();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Fetching course with ID:', params.id);
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${server}/api/course/${params.id}`,
          {
            headers: {
              'token': token
            },
          }
        );
        
        console.log('Course data received:', data);
        
        // Check if data has course property or if data itself is the course
        const courseData = data.course || data;
        
        if (!courseData || !courseData._id) {
          throw new Error('Course not found or invalid data');
        }
        
        // Ensure we have the correct course structure
        const formattedCourse = {
          id: courseData._id,
          title: courseData.title,
          description: courseData.description,
          price: courseData.price,
          image: courseData.image,
          duration: courseData.duration,
          createdBy: courseData.createdBy
        };
        
        console.log('Formatted course:', formattedCourse);
        setCourse(formattedCourse);
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Failed to load course details');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    } else {
      console.error('No course ID provided');
      toast.error('No course ID provided');
      navigate('/courses');
    }
  }, [params.id, navigate]);

  const handlePaymentSuccess = (paymentIntentId) => {
    navigate(`/payment-success/${paymentIntentId}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (!course) {
    return <div className="error-container">Course not found</div>;
  }

  return (
    <div className="stripe-payment-page">
      {isTestMode && (
        <div className="test-mode-banner">
          🧪 Test Mode - No real payments will be processed
        </div>
      )}
      <div className="payment-container">
        <div className="payment-header">
          <h1>Complete Your Purchase</h1>
          <p>Secure payment powered by Stripe</p>
        </div>

        <div className="payment-content">
          {isTestMode ? (
            <TestCheckoutForm 
              course={course} 
              onSuccess={handlePaymentSuccess}
            />
          ) : (
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                course={course} 
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}
        </div>

        <div className="payment-footer">
          <div className="security-info">
            <div className="security-icon">🔒</div>
            <div className="security-text">
              <h4>Secure Payment</h4>
              <p>Your payment information is encrypted and secure</p>
            </div>
          </div>
          <div className="support-info">
            <p>Need help? Contact our support team</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePayment;