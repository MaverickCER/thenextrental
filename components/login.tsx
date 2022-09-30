import { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import useAuth from '../context/auth';
import { useState } from 'react';

interface Inputs {
  email: string;
  password: string;
}

type properties = FunctionComponent<{
  setIsTracking: Dispatch<SetStateAction<boolean>>;
}>;

const Login: properties = ({ setIsTracking }) => {
  const { signIn, signUp, loading, error } = useAuth();
  const [login, setLogin] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!loading) {
      if (login) {
        await signIn(data.email, data.password);
      } else {
        await signUp(data.email, data.password);
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>{loading ? 'Loading...' : 'Sign In'}</h1>
        {error && <h4>{error}</h4>}
        {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}
        <div>
          <label>
            <input
              onBlurCapture={() => setIsTracking(true)}
              onFocusCapture={() => setIsTracking(false)}
              type="email"
              placeholder="Email"
              {...register('email', { required: true })}
            />
            {errors.email && <p>Please enter a valid email.</p>}
          </label>
          <label>
            <input
              onBlurCapture={() => setIsTracking(true)}
              onFocusCapture={() => setIsTracking(false)}
              autoComplete="current-password"
              type="password"
              {...register('password', { required: true })}
              placeholder="Password"
            />
            {errors.password && <p>Your password must contain between 4 and 60 characters.</p>}
          </label>
        </div>
        <button onClick={() => setLogin(true)} type="submit">
          Sign In
        </button>
        <button onClick={() => setLogin(false)} type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Login;
