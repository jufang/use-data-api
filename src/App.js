import React, { Fragment, useState, useEffect, useReducer } from 'react';
import axios from 'axios';


const useDataApi = (initUrl, initData) => {
  // hook1
  // const [data, setData] = useState(initData);
  // const [url, doFetch] = useState(initUrl)
  // const [isLoading, setIsLoading] = useState(false);
  // const [isError, setIsError] = useState(false);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsError(false);
  //     setIsLoading(true);
  //     try {
  //       const result = await axios(url);
  //       setData(result.data);
  //     } catch(error) {
  //       setIsError(true);
  //     }
  //     setIsLoading(false);
  //   };

  //   fetchData();
  // }, [url]);
  // return [{data, isLoading, isError}, doFetch]

  //  加载数据状态的reducer
  const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false
        }
      case 'FETCH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload
        }
      case 'FETCH_ERROR':
        return {
          ...state,
          isLoading: false,
          isError: true,
        }
      default:
        break;
    }
  }
  const [url, doFetch] = useState(initUrl)
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initData,
  })
  // didCancel在组件已经卸载时，ajax请求还在继续，之后会去setState数据情况
  useEffect(()=>{
    let didCancel = false
    const fetchData = async () => {
      dispatch({type:'FETCH_INIT'})
      try{
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data })
        }
      } catch(err) {
        if (!didCancel) {
          dispatch({type:'FETCH_ERROR'})
        }
      }
    }
    fetchData()
    return () => {
      didCancel = true
    }
  }, [url])
  return [state, doFetch]
}
function App() {
  const [{data, isLoading, isError}, doFetch] = useDataApi('http://hn.algolia.com/api/v1/search?query=redux', {hits: []})
  const [query, setQuery] = useState('redux');
 
  return (
    <Fragment>
      <form
        onSubmit={(event) => {
          doFetch(`http://hn.algolia.com/api/v1/search?query=${query}`)
          event.preventDefault()
        }}
      >
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {isError && <div>Something went wrong ...</div>}
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul>
          {data.hits.map(item => (
            <li key={item.objectID}>
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      )}
    </Fragment>
  );
}

export default App;