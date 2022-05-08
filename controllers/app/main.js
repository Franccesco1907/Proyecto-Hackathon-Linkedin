const router = require('express').Router()
const token = require('../../db/models/token')
const profile = require('../../db/models/profile')
const TwitterKeys = require('../../config/twitter')
const TwitterClient = require('twitter-api-client').TwitterClient
const SerpApi = require('google-search-results-nodejs')
const { getData, postData } = require('../utils/fetch')
const { urlencode, clientId, clientSecret } = require('../../config/linkedin')
const GoogleKeys = require('../../config/google')

// Google Search
const googleClient = new SerpApi.GoogleSearch(GoogleKeys.apiKey)

// Twitter: Doesn't work because the free plan for developers is limited, so we can't search profiles with completely name, but if linkedin account has twitter username, we can find the information
const twitterClient = new TwitterClient({
    apiKey: TwitterKeys.apiKey,
    apiSecret: TwitterKeys.apiKeySecret,
    accessToken: TwitterKeys.accessToken,
    accessTokenSecret: TwitterKeys.accessTokenSecret,
})

// Main route API
router.route('/')
    .get(async (req, res) => {
        try {
            // This functionality is for linkedin APIs, to get the access tokens and others
            let code = req.query.code
            if (code) {
                // Update the token
                await token.findOneAndUpdate({ id: 1 }, { code }, { new: true })
                // Get the access token
                let response = await postData(`https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&redirect_uri=${urlencode}&client_id=${clientId}&client_secret=${clientSecret}&code=${code}`, {})
                // Save the access token
                await token.findOneAndUpdate({ id: 2 }, { code: response.access_token }, { new: true })
            }
        } catch (e) {
            console.log(e)
        }
        res.render('app/index')
    })

// API that searchs all person information with the linkedin URL
router.route('/search-person-information')
    .post(async (req, res) => {
        let response = { result: 'NOK', content: {} }

        try {
            const { publicId } = req.body // Get the linkedin publicUrl as input 

            let profileUser = await profile.findOne({ publicId }).exec() // Search the publicId user in the database to save some time workins as cache
            if (profileUser) {
                response.content = profileUser
                response.result = 'OK'
                res.json(response).status(200)
            } else {
                let linkedinData = await postData('http://10.150.0.3:3000/get-linkedin-data', { publicId }) // Call the flask API that collects all the linkedin information 
                linkedinData = JSON.parse(linkedinData)
                let name = linkedinData.profile.firstName + linkedinData.profile.lastName // Get the name which will be the input for the Google Search
                let photoInformation = {}

                response.content.linkedin = linkedinData // Save the linkedin information in response

                if (linkedinData.contact.twitter.length) { // If the linkedin data returns twitter information, we get twitter information
                    let username = linkedinData.contact.twitter[0].name
                    response.content.twitter = await getData(`https://api.twitter.com/2/users/by/username/${username}?user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld&expansions=pinned_tweet_id&tweet.fields=attachments,author_id,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld`, TwitterKeys.bearerToken)
                    response.content.twitter.existsData = true
                } else {
                    response.content.twitter = { existsData: false }
                }

                // Call the Google API for collects all the google information
                await googleClient.json({
                    q: name, // The query search is the name person
                    location: "Lima Region" // The location can be get it from the linkedin data
                }, async (result) => {
                    response.content.google = result // Save the google information in response
                    response.result = 'OK'

                    if (result.inline_images !== undefined) {
                        photoInformation = await postData('http://10.150.0.3:3000/get-face-information', { imageUrl: result.inline_images[0].thumbnail })
                        photoInformation = JSON.parse(photoInformation)
                        photoInformation.data = true
                    } else {
                        photoInformation.data = false
                    }

                    response.content.photoInformation = photoInformation
                    response.content = filterInformation(response.content)
                    await profile.create({ ...response.content, publicId })
                    res.json(response).status(200)
                })
            }
        } catch (e) {
            console.log(e)
            res.json(response).status(200)
        }
    })

router.route('/profile')
    .get(async (req, res) => {
        let publicId = req.query.publicId

        if (publicId) {
            res.render('app/profile', { publicId })
        } else {
            res.render('app/404')
        }
    })

router.route('/recent-search')
    .get(async (req, res) => {
        let profiles = await profile.find({})
        res.render('app/recent-search', { profiles })
    })

router.route('/get-profiles')
    .get(async (req, res) => {
        let profiles = await profile.find({})
        res.json(profiles).status(200)
    })

// API that gets twitter information, but It's also limited for the basic plan, even so, we send a form expecting we can access to all APIs 
router.route('/twitter/:query')
    .get(async (req, res) => {
        const query = req.params.query
        let response = { result: 'NOK' }

        try {
            response.content = await twitterClient.tweets.search({ q: query })
            response.result = 'OK'
        } catch (e) {
            console.error(e)
        }

        res.json(response).status(200)
    })

module.exports = router;

function filterInformation(data) {
    let profileLinkedin = data.linkedin.profile
    let contactLinkedin = data.linkedin.contact
    return {
        linkedin: {
            //countryCode: data.location.basicLocation.countryCode,
            education: profileLinkedin.education,
            experience: profileLinkedin.experience,
            name: profileLinkedin.firstName + ' ' + profileLinkedin.lastName,
            countryName: profileLinkedin.geoCountryName,
            headline: profileLinkedin.headline,
            industryName: profileLinkedin.industryName,
            location: profileLinkedin.location,
            locationName: profileLinkedin.locationName,
            skills: profileLinkedin.skills,
            contact: contactLinkedin
        },
        google: {
            inline_images: data.google.inline_images,
            organic_results: data.google.organic_results,
            pagination: data.google.pagination,
            google_url: data.google.search_metadata.google_url
        },
        twitter: data.twitter,
        photoInformation: data.photoInformation
    }
}