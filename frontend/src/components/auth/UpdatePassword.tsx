import React, { useState, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';

interface UpdatePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UpdatePassword = () => {
  const { updatePassword } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialValues: UpdatePasswordFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  const validationSchema = Yup.object({
    currentPassword: Yup.string()
      .required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password must be at most 16 characters')
      .matches(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
        'Password must contain at least one uppercase letter and one special character'
      )
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm password is required')
  });

  const handleSubmit = async (values: UpdatePasswordFormValues, { setSubmitting, resetForm }: any) => {
    try {
      setError('');
      setSuccess('');
      
      await updatePassword(values.currentPassword, values.newPassword);
      
      setSuccess('Password updated successfully!');
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Update Password</h2>
      
      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="auth-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <Field
                type="password"
                id="currentPassword"
                name="currentPassword"
                className="form-control"
              />
              <ErrorMessage name="currentPassword" component="div" className="form-error" />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <Field
                type="password"
                id="newPassword"
                name="newPassword"
                className="form-control"
              />
              <ErrorMessage name="newPassword" component="div" className="form-error" />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <Field
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
              />
              <ErrorMessage name="confirmPassword" component="div" className="form-error" />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UpdatePassword;
