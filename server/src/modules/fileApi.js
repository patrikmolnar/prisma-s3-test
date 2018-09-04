const uuid = require('uuid/v1')
const aws = require('aws-sdk')

const s3 = new aws.S3({
  accessKeyId: 'AKIAIFETDGZXBW52I5LA',
  secretAccessKey: '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',
  params: {
    Bucket: 'com.ushop.enrolluploads'
  },
})

exports.processUpload = async ( upload, ctx ) => {
  if (!upload) {
    return console.log('ERROR: No file received.')
  }
  
  const { stream, filename, mimetype, encoding } = await upload
  const key = uuid() + '-' + filename

  // Upload to S3
  const response = await s3
    .upload({
      Key: key,
      ACL: 'public-read',
      Body: stream
    }).promise()

  const url = response.Location

  // Sync with Prisma
  const data = {
    filename,
    mimetype,
    encoding,
    url,
  }

  const { id } = await ctx.db.mutation.createFile({ data }, ` { id } `)

  const file = {
    id,
    filename,
    mimetype,
    encoding,
    url,
  }

  console.log('saved prisma file:')
  console.log(file)

  return file
}