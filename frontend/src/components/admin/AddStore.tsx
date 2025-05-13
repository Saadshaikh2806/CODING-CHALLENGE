import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createStore } from '../../services/store.service';
import { getAllUsers } from '../../services/user.service';
import type { User } from '../../types';

interface AddStoreFormValues {
  name: string;
  email: string;
  address: string;
  ownerId: string;
}

const AddStore = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const initialValues: AddStoreFormValues = {
    name: '',
    email: '',
    address: '',
    ownerId: ''
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    address: Yup.string()
      .max(400, 'Address must be at most 400 characters')
      .required('Address is required'),
    ownerId: Yup.string()
      .nullable()
  });

  const handleSubmit = async (values: AddStoreFormValues, { setSubmitting, resetForm }: any) => {
    try {
      setError('');
      setSuccess('');

      const storeData = {
        ...values,
        ownerId: values.ownerId ? parseInt(values.ownerId) : null
      };

      await createStore(storeData);

      setSuccess('Store created successfully!');
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create store. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Add New Store</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="name">Store Name</label>
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
                  <label htmlFor="ownerId">Store Owner (Optional)</label>
                  <Field
                    as="select"
                    id="ownerId"
                    name="ownerId"
                    className="form-control"
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="ownerId" component="div" className="form-error" />
                  <small className="form-text text-muted">
                    If selected, the user's role will be changed to Store Owner.
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Store'}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default AddStore;
