import { useState } from 'react'
import "../src/css/index.css";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <h1 className='bg-teal-500 text-3xl'>Hello World!</h1>
    </>
  )
}

export default App
