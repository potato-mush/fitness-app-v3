import React, { useState, useEffect, useRef } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import QRCode from 'qrcode.react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
  createStyles({
    dialog: {
      '& .MuiDialog-paper': {
        margin: 0,
      },
    },
    dialogContent: {
      overflow: 'hidden'
    }
  })
);

function Dashboard() {
  const classes = useStyles();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { getAllUsers, addNewUser, logout } = useAuth();
  const navigate = useNavigate();
  const qrDialogRef = useRef(null);
  const addUserDialogRef = useRef(null);
  const logoutDialogRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError('');
        if (typeof getAllUsers === 'function') {
          const usersList = await getAllUsers();
          if (mounted) {
            setUsers(usersList || []);
          }
        } else if (mounted) {
          setError('User loading functionality not available');
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load users: ' + err.message);
          console.error('Error loading users:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [getAllUsers]);

  const handleAddUser = async () => {
    try {
      if (typeof addNewUser === 'function') {
        const fullName = `${newUserData.firstName} ${newUserData.lastName}`.trim();
        const userData = {
          name: fullName,
          email: newUserData.email,
          password: newUserData.password
        };

        const result = await addNewUser(userData);
        if (result.success) {
          setIsAddUserModalOpen(false);
          setNewUserData({ firstName: '', lastName: '', email: '', password: '' });
          await fetchUsers(); // Use fetchUsers instead of loadUsers
        } else {
          setError(result.error || 'Failed to add user');
        }
      }
    } catch (err) {
      setError('Failed to add user: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maskName = (fullName) => {
    if (!fullName) return '';
    const [firstName = '', lastName = ''] = fullName.split(' ');
    const maskedFirst = firstName ? `${firstName[0]}•••${firstName.slice(-1)}` : '';
    const maskedLast = lastName ? `${lastName[0]}•••${lastName.slice(-1)}` : '';
    return maskedLast ? `${maskedFirst} ${maskedLast}` : maskedFirst;
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    return `${localPart[0]}•••${localPart.slice(-1)}@${domain}`;
  };

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return 'N/A';
      
      // Handle string timestamps (ISO format)
      if (typeof timestamp === 'string') {
        timestamp = new Date(timestamp).getTime();
      }
      
      // Handle objects (Firestore Timestamps)
      if (timestamp?.seconds) {
        timestamp = timestamp.seconds * 1000;
      }

      const date = new Date(timestamp);
      
      // Validate date
      if (isNaN(date.getTime())) {
        console.log('Invalid timestamp:', timestamp);
        return 'Invalid Date';
      }

      return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date);

    } catch (error) {
      console.error('Date formatting error:', error, timestamp);
      return 'Invalid Date';
    }
  };

  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      flex: 1, 
      minWidth: 200,
      renderCell: (params) => (
        <div title={params.value}>{params.value}</div>
      )
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => (
        <div title={params.value}>{maskName(params.value)}</div>
      )
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1.5, 
      minWidth: 200,
      renderCell: (params) => (
        <div title={params.value}>{maskEmail(params.value)}</div>
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      flex: 1, 
      minWidth: 250,
      renderCell: (params) => (
        <div title={params.value}>
          {formatDate(params.value)}
        </div>
      )
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      flex: 0.8, 
      minWidth: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            setSelectedUserId(params.row.id);
            setIsQRModalOpen(true);
          }}
        >
          Generate QR
        </Button>
      ),
    },
  ];

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    const qrCodeImage = document.querySelector('#qr-code-to-print canvas').toDataURL();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              height: auto;
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100%;
              padding: 20px;
              box-sizing: border-box;
            }
            .container {
              text-align: center;
              page-break-inside: avoid;
            }
            img {
              width: 256px;
              height: 256px;
              display: block;
            }
            @media print {
              @page {
                size: auto;
                margin: 0mm;
              }
              html, body {
                height: 100vh;
                overflow: hidden;
              }
              body {
                padding: 40px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qrCodeImage}" />
          </div>
          <script>
            window.onload = () => window.print();
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>User Management</h1>
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="header-right">
          <div className="dashboard-actions">
            <TextField
              placeholder="Search users..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsAddUserModalOpen(true)}
            >
              Add User
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setIsLogoutDialogOpen(true)}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div style={{ height: 600, width: '100%', backgroundColor: 'white', borderRadius: '8px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading users...</div>
        ) : (
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
            style={{ width: '100%' }}
            sx={{
              '& .MuiDataGrid-main': {
                width: '100%'
              }
            }}
          />
        )}
      </div>
      {/* QR Code Modal */}
      <Dialog 
        open={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)}
        className={classes.dialog}
        ref={qrDialogRef}
        TransitionProps={{
          timeout: 500,
        }}
      >
        <DialogTitle>User QR Code</DialogTitle>
        <DialogContent>
          <div style={{ padding: '20px' }} id="qr-code-to-print">
            <QRCode value={selectedUserId || ''} size={256} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrintQR} color="primary">
            Print QR
          </Button>
          <Button onClick={() => setIsQRModalOpen(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add User Modal */}
      <Dialog 
        open={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)}
        className={classes.dialog}
        ref={addUserDialogRef}
        TransitionProps={{
          timeout: 500,
        }}
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="First Name"
            fullWidth
            value={newUserData.firstName}
            onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            value={newUserData.lastName}
            onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newUserData.email}
            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newUserData.password}
            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddUserModalOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddUser} color="primary">
            Add User
          </Button>
        </DialogActions>
      </Dialog>
      {/* Logout Confirmation Dialog */}
      <Dialog 
        open={isLogoutDialogOpen} 
        onClose={() => setIsLogoutDialogOpen(false)}
        className={classes.dialog}
        ref={logoutDialogRef}
        TransitionProps={{
          timeout: 500,
        }}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          Are you sure you want to logout?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLogoutDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="secondary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Dashboard;
