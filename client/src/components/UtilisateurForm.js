import React from 'react';

function Form(props) {
  return (
    <form>
    <input
        placeholder="Pseudo..."
        type="text"
        value={props.pseudo}
        onChange={props.onChange}
        autoFocus={true}
        />
        <button onClick={props.connect}>Connection</button>
    </form>
  );
};

export default Form;
