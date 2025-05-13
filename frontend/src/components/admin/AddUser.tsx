import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createUser } from '../../services/user.service';

interface AddUserFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  role: string;
}

const AddUser = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialValues: AddUserFormValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    role: 'user'
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(20, 'Name must be at least 20 characters')
      .max(60, 'Name must be at most 60 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password must be at most 16 characters')
      .matches(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
        'Password must contain at least one uppercase letter and one special character'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
    address: Yup.string()
      .max(400, 'Address must be at most 400 characters')
      .required('Address is required'),
    role: Yup.string()
      .oneOf(['admin', 'user', 'store_owner'], 'Invalid role')
      .required('Role is required')
  });

  const handleSubmit = async (values: AddUserFormValues, { setSubmitting, resetForm }: any) => {
    try {
      setError('');
      setSuccess('');
      
      const { confirmPassword, ...userData } = values;
      await createUser(userData);
      
      setSuccess('User created successfully!');
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Add New User</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                />
                <ErrorMessage name="name" component="div" className="form-error" />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                />
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                />
                <ErrorMessage name="password" component="div" className="form-error" />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                />
                <ErrorMessage name="confirmPassword" component="div" className="form-error" />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <Field
                  as="textarea"
                  id="address"
                  name="address"
                  className="form-control"
                  rows={3}
                />
                <ErrorMessage name="address" component="div" className="form-error" />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <Field
                  as="select"
                  id="role"
                  name="role"
                  className="form-control"
                >
                  <option value="user">Normal User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </Field>
                <ErrorMessage name="role" component="div" className="form-error" />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddUser;
