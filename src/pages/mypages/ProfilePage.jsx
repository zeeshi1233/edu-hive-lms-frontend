

const ProfilePage = () => {
  const user = {
    name: "Abdul Hannan Ahmed",
    roll: "23CS-123",
    email: "abdulhannan@gmail.com",
    phone: "+92 3128955456",
    department: "Computer Science/Information Technology",
    semester: "Fall 2025",
    image: "https://placehold.co/150x150", // Replace with actual image
  };

  return (
    <div className="w-100 py-5" style={{ backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      <div className="container">
        <div className="card shadow-lg radius-16 p-5" style={{ backgroundColor: "#ffffff" }}>
          
          {/* Top Row: Profile Pic */}
          <div className="d-flex align-items-center mb-4">
            <img
              src={'assets/images/user.jpg'}
              alt="Profile"
              className="rounded-circle border border-3 border-primary me-4"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
            <div>
              <h2 className="fw-bold mb-2">{user.name}</h2>
              <span className="badge  px-3 py-4 fs-6" style={{background:"#FEBA01", color:"#000"}}>{user.semester}</span>
            </div>
          </div>

          {/* User Info Grid */}
          <div className="row g-3 mt-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Full Name</label>
              <input type="text" className="form-control" value={user.name} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Email</label>
              <input type="email" className="form-control" value={user.email} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Phone</label>
              <input type="text" className="form-control" value={user.phone} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Roll Number</label>
              <input type="text" className="form-control" value={user.roll} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Department</label>
              <input type="text" className="form-control" value={user.department} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Semester</label>
              <input type="text" className="form-control" value={user.semester} readOnly />
            </div>
          </div>

        

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
