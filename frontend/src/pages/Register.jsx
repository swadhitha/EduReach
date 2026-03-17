import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Input from '../components/Input.jsx'
import Button from '../components/Button.jsx'
import { authService } from '../services/authService.js'

export default function Register() {
  const { register, handleSubmit, watch, setValue, formState } = useForm({
    defaultValues: {
      role: 'donor',
      schoolDetails: {
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        udiseCode: '',
        schoolType: 'government',
      },
      contactPerson: {
        name: '',
        role: '',
        phone: '',
      },
      verification: {
        documentUrl: '',
      },
    },
  })
  const { errors } = formState
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const role = watch('role')

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    setSuccess('')
    try {
      if (values.role === 'school') {
        const payload = {
          email: values.email,
          password: values.password,
          schoolDetails: values.schoolDetails,
          contactPerson: values.contactPerson,
          verification: values.verification,
        }
        await authService.schoolRegister(payload)
      } else if (values.role === 'volunteer') {
        await authService.volunteerRegister(values)
      } else {
        await authService.register(values)
      }
      setSuccess('Account created. You can now login.')
      setTimeout(() => navigate('/login'), 900)
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          'Unable to register. Please review your details.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card
          title="Create an account"
          description="Choose your role and start supporting education."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['donor', 'school', 'volunteer'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setValue('role', r, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }}
                  className={`rounded-lg border px-3 py-2 capitalize ${
                    role === r
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
              <input type="hidden" {...register('role')} />
            </div>

            <Input
              label={role === 'school' ? 'School name' : 'Name'}
              name={role === 'school' ? 'schoolDetails.name' : 'name'}
              register={register}
              error={role === 'school' ? errors.schoolDetails?.name : errors.name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors.password}
            />

            {role === 'school' && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="School type"
                    name="schoolDetails.schoolType"
                    register={register}
                    error={errors.schoolDetails?.schoolType}
                    list="school-type-options"
                    placeholder="government / aided / private_non_profit"
                  />
                  <datalist id="school-type-options">
                    <option value="government" />
                    <option value="aided" />
                    <option value="private_non_profit" />
                  </datalist>

                  <Input
                    label="UDISE code"
                    name="schoolDetails.udiseCode"
                    register={register}
                    error={errors.schoolDetails?.udiseCode}
                  />
                </div>

                <Input
                  label="Address"
                  name="schoolDetails.address"
                  register={register}
                  error={errors.schoolDetails?.address}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input
                    label="City"
                    name="schoolDetails.city"
                    register={register}
                    error={errors.schoolDetails?.city}
                  />
                  <Input
                    label="State"
                    name="schoolDetails.state"
                    register={register}
                    error={errors.schoolDetails?.state}
                  />
                  <Input
                    label="Pincode"
                    name="schoolDetails.pincode"
                    register={register}
                    error={errors.schoolDetails?.pincode}
                    inputMode="numeric"
                    placeholder="6 digits"
                  />
                </div>

                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-700">
                    Contact person
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Name"
                      name="contactPerson.name"
                      register={register}
                      error={errors.contactPerson?.name}
                    />
                    <Input
                      label="Role"
                      name="contactPerson.role"
                      register={register}
                      error={errors.contactPerson?.role}
                      placeholder="Principal / Headmaster"
                    />
                  </div>
                  <div className="mt-4">
                    <Input
                      label="Phone"
                      name="contactPerson.phone"
                      register={register}
                      error={errors.contactPerson?.phone}
                      inputMode="numeric"
                      placeholder="10 digits"
                    />
                  </div>
                </div>

                <Input
                  label="Verification document URL"
                  name="verification.documentUrl"
                  register={register}
                  error={errors.verification?.documentUrl}
                  placeholder="https://..."
                />
              </>
            )}

            {serverError && (
              <p className="text-xs text-red-500">{serverError}</p>
            )}
            {success && (
              <p className="text-xs text-emerald-600">{success}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Creating account…' : 'Register'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

