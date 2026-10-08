import { useState } from 'react';
import useAuth from '../hooks/useAuth';

const ProfilePage = () => {
  const { user, updateProfile, uploadProfilePicture, error } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    course: user?.course || '',
    semester: user?.semester || 1,
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    
    // Parse comma separated strings back to arrays
    const updateData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
    };
    
    const result = await updateProfile(updateData);
    
    if (result.success) {
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    }
    
    setIsSubmitting(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    await uploadProfilePicture(data);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Cover / Header area */}
        <div className="h-32 bg-primary-600"></div>
        
        <div className="px-4 sm:px-6 lg:px-8 pb-8 relative">
          <div className="sm:flex sm:items-end sm:space-x-5 -mt-12">
            <div className="relative group">
              {user.profilePicture ? (
                <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32 object-cover bg-white" src={user.profilePicture} alt="Profile" />
              ) : (
                <div className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32 bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-sm font-medium">Change</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            
            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{user.name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block md:hidden mt-6 min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {isEditing ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">College / University</label>
                  <input type="text" name="college" value={formData.college} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course / Branch</label>
                  <input type="text" name="course" value={formData.course} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <input type="number" name="semester" min="1" max="10" value={formData.semester} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Tell us about yourself..."></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="React, Python, Figma" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Interests (comma separated)</label>
                  <input type="text" name="interests" value={formData.interests} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Machine Learning, Open Source" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
                  <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="https://github.com/username" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                  <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="https://linkedin.com/in/username" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:bg-primary-400">
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">College</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.college || 'Not specified'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Course & Semester</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.course ? `${user.course}, Sem ${user.semester}` : 'Not specified'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.bio || 'No bio added yet.'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Skills</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.skills && user.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : 'No skills added'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Interests</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.interests && user.interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.interests.map((interest, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : 'No interests added'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">GitHub</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.githubUrl ? (
                      <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {user.githubUrl}
                      </a>
                    ) : 'Not specified'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">LinkedIn</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.linkedinUrl ? (
                      <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {user.linkedinUrl}
                      </a>
                    ) : 'Not specified'}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
