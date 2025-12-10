import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/UserList.test.jsx';
import TaskForm from './components/TaskForm';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const isLogged = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        <header>
          <h1>Task Manager</h1>
          <nav>
            <Link to="/tasks">Tasks</Link>
            {isLogged ? (
              <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <div>
                  <TaskForm />
                  <TaskList />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to={isLogged ? '/tasks' : '/login'} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;