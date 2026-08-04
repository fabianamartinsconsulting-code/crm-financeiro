const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      alert('Login OK!')
    } catch (err) {
      alert('ERRO NO LOGIN: ' + err.code + ' | ' + err.message)
      setError('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
}
