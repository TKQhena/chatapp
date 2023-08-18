import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
  const [data, setData] = useState(null);
  const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);
  async function handleSubmit(ev) {
    ev.preventDefault();
    if (isLoginOrRegister === 'register') {
      axios.post('/user/register', {username, email, password})
      .then(res => {
        setData(res.data);
      }).catch(err => {
        console.log(err);
      })
    }
    else if(isLoginOrRegister){
      axios.post('/user/login', {username, password})
      .then(res => {
        setData(res.data);
      })
      console.log(data)
    }
    if (data) {
      setLoggedInUsername(data.username);
      setId(data.id);
    }else{
      alert('Something went wrong');
    }
  }
  return (
    <div className="bg-gray-50 h-screen flex items-center">
      <form onSubmit={handleSubmit} className="w-64 mx-auto mb-12">
        <ul className="flex gap-4 block auto mb-2">
        <li>
          <button onClick={(e) => {
            e.preventDefault();
            setIsLoginOrRegister('login')
            }}>Login</button>
        </li>
        <li>
          <button onClick={(e) =>{
            e.preventDefault();
            setIsLoginOrRegister('register')
          } }>Register</button>
        </li>
      </ul>
        {isLoginOrRegister === 'login' && (
          <div>
            <input value={username}
               onChange={e => setUsername(e.target.value)}
               type="text" placeholder="username"
               className="block w-full rounded-sm p-2 mb-2 border" />
            <input value={password}
               onChange={e => setPassword(e.target.value)}
               type="password"
               placeholder="password"
               className="block w-full rounded-sm p-2 mb-2 border" />
            <button type="submit" className="block w-full rounded-sm p-2 mb-2 bg-blue-500 text-white">Login</button>
          </div>
        )}
        {isLoginOrRegister === 'register' && (
          <div>
            <input type="text" 
              className="block w-full rounded-sm p-2 mb-2 border" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
              />
            <input type="text" 
              className="block w-full rounded-sm p-2 mb-2 border" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="email"
            />
            <input 
              type="password" 
              placeholder="password"
              className="block w-full rounded-sm p-2 mb-2 border" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              />
            <button type="submit" className="block w-full rounded-sm p-2 mb-2 bg-blue-500 text-white">Register</button>
          </div>
        )}
      </form>
    </div>
  );
}