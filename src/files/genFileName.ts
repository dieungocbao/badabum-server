import { v4 as uuid } from 'uuid'

export const genFileName = (req, file, callback) => {
  const fileExtName = file.originalname.split('.')[1]
  callback(null, `${uuid()}.${fileExtName}`)
}
