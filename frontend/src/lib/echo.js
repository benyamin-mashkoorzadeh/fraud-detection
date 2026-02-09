import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echo = null

if (typeof window !== 'undefined') {
    window.Pusher = Pusher
    echo = new Echo({
        broadcaster: 'pusher',
        key: '21198a9e66840e70c6ba', // کلید پوشیر خودتون رو وارد کنید
        cluster: 'eu', // کلستر پوشیر خودتون
        forceTLS: true,
    })
}

export { echo }
