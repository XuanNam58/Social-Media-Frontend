import React from 'react'
import ProfileUserDetails from '../../Components/ProfileComponents/ProfileUserDetails'
import ReqUserPostPart from '../../Components/ProfileComponents/ReqUserPostPart'
import ProfileUserDetailChange from '../../Components/ProfileComponents/ProfileUserDetailChange'
const Profile = () => {
  return (
    <div className='px-20'>
        <div>
          <ProfileUserDetailChange/>
        </div>

        <div>
          <ReqUserPostPart/>
        </div>
    </div>
  )
}

export default Profile