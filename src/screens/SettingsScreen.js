import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Back-end/supabaseClient';
import Sidebar from '../components/Sidebar';
import '../styles/SettingsScreen.css';
import '../styles/sidebar.css';

const SettingsScreen = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user }, error: authError } = await supabase.auth.getUser();
            console.log('Auth User:', user);

            if (authError) throw authError;
            if (!user) {
                navigate('/login');
                return;
            }

            const { data: profile, error: fetchError } = await supabase
                .from('users')
                .select('first_name, last_name, email')
                .eq('id', user.id)
                .single();

            console.log('Profile Data:', profile);

            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    const { data: newProfile, error: insertError } = await supabase
                        .from('users')
                        .insert([
                            {
                                id: user.id,
                                email: user.email,
                                first_name: '',
                                last_name: ''
                            }
                        ])
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    
                    const newUserData = {
                        firstName: newProfile.first_name || '',
                        lastName: newProfile.last_name || '',
                        email: user.email
                    };
                    setUserData(newUserData);
                    setEditFormData(newUserData);
                } else {
                    throw fetchError;
                }
            } else {
                const profileData = {
                    firstName: profile.first_name || '',
                    lastName: profile.last_name || '',
                    email: profile.email || user.email
                };
                setUserData(profileData);
                setEditFormData(profileData);
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditFormData(userData);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setError(null);
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError) throw authError;
            if (!user) throw new Error('Not authenticated');

            if (!editFormData.firstName.trim() || !editFormData.lastName.trim()) {
                alert('First name and last name are required');
                return;
            }

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    first_name: editFormData.firstName.trim(),
                    last_name: editFormData.lastName.trim(),
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setUserData(editFormData);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            setError(error.message);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="settings-content">
                <div className="settings-form-container">
                    <h2>Profile Settings</h2>
                    <div className="form-section">
                        {!isEditing ? (
                            <>
                                <div className="user-info">
                                    <div className="info-group">
                                        <label>First Name:</label>
                                        <p>{userData.firstName}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Last Name:</label>
                                        <p>{userData.lastName}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Email:</label>
                                        <p>{userData.email}</p>
                                    </div>
                                    <button className="edit-button" onClick={handleEdit}>
                                        Edit Profile
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name*</label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={editFormData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name*</label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={editFormData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={editFormData.email}
                                        disabled={true}
                                        readOnly
                                    />
                                </div>
                                <div className="button-group">
                                    <button className="save-button" onClick={handleSave}>
                                        Save Changes
                                    </button>
                                    <button className="cancel-button" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                        <button
                            className="change-password-button"
                            onClick={() => navigate('/change-password')}
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;