/* eslint-disable indent */
'use strict';

//Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

//Load Environment Variables from the .env file
require ('dotenv').config();

//Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

//API route

app.get('/location', (request, response) => {
	searchToLatLong(request.query.data)
	.then((location) => response.send(location))
	.catch((error) => handleError(error, response));
});

app.get('/weather', getWeather);

app.get('/yelp', getYelp);

app.get('/movies', getMovies);

app.get('/meetups', getMeetup);

// app.get('/trails', getTrails);

//Error Handling
function handleError(err, res) {
	console.error(err);
	if (res) res.satus(500).send('Sorry, somthing went wrong');
}

//Helper functions
function searchToLatLong(query) {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
// console.log(url);
	return superagent.get(url)
	.then(res => {
		// console.log(res.body);
		return new Location(query, res);
	})
	.catch((error, res) => handleError(error, res));
}

function getWeather(request, response) {
	const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

	superagent.get(url)
		.then(result => {
			const weatherSummaries = result.body.daily.data.map(day => {
				return new Weather(day);
			});
		response.send(weatherSummaries);
		})
		.catch(error => handleError(error, response));
}

function getYelp(request, response) {
	const url = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${request.query.data.latitude}&longitude=${request.query.data.longitude}`;

	superagent.get(url)
	.set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
	.then( result => {
		// console.log(result);
		const yelpBusinesses = result.body.businesses.map(restaurant => {
			return new Yelp(restaurant);
		});
	response.send(yelpBusinesses);
	})
	.catch(error => handleError(error, response));
}

function getMovies(request, response) {
	const url = `https://api.themoviedb.org/3/search/movie?query=${request.query.data.search_query}&api_key=${process.env.MOVIEDB_API_KEY}`
	// const url = `https://api.themoviedb.org/3/search/movie?/api_key=${process.env.MOVIEDB_API_KEY}&query=${request.query.data.search_query}`;
	// console.log('this is the url', url);
	// console.log('this the is search_query', request.query.data.search_query)
	superagent.get(url)
	.then(result => {
		// console.log(result.body.results);
		const movieSet = result.body.results.map( movie => {
			return new Movie(movie);
		});
	response.send(movieSet);
	})
	.catch(error => handleError(error, response));
}

function getMeetup(request, response){  //https://api.meetup.com/find/upcoming_events?key=4d544e46124361327a32401768346232&lon=-122.3&page=20&lat=47.6
	const url = `https://api.meetup.com/find/upcoming_events?key=${process.env.MEETUP_API_KEY}&lon=${request.query.data.longitude}&page=20&lat=${request.query.data.latitude}`
console.log('url', url);
	superagent.get(url)
	.then(result => {
console.log(result.body);
		const meetups = result.body.events.map( meetup => {
			return new Meetup(meetup);
		});
	response.send(meetups);
	})
	.catch(error => handleError(error, response));
}

// function getTrails(request, response){
// 	const url = `https://www.hikingproject.com/data/get-trails?lat=${request.query.data.latitude}&lon=${request.query.data.longitude}&maxDistance=10&key=${process.env.HIKING_PROJECT_API_KEY}`
// 	console.log('url is', url);
// 	superagent.get(url)
// }

function handleError(error, res){
	console.error(error);
	if (res) res.status(500).send('Sorry, something broke');
}

// models

function Location(query, res) {
	this.search_query = query;
	this.formatted_query = res.body.results[0].formatted_address;
	this.latitude = res.body.results[0].geometry.location.lat;
	this.longitude = res.body.results[0].geometry.location.lng;
}

function Weather(day) {
	this.forecast = day.summary;
	this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function Yelp(restaurant) {
	this.url = restaurant.url;
	this.name = restaurant.name;
	this.rating = restaurant.rating;
	this.price = restaurant.price;
	this.img_url = restaurant.img_url;
}

function Movie(movie) {
	this.title = movie.title;
	this.released_on = movie.release_date;
	this.average_votes = movie.vote_average;
	this.total_votes = movie.vote_count;
	this.image_url = `http://image.tmdb.org/t/p/w185/${movie.poster_path}`
	this.overview = movie.overview;
	this.popularity = movie.popularity
}

function Meetup(meetup) {
	this.link = meetup.link;
	this.name = meetup.name;
	this.host = meetup.group.name;
	this.creation_date = meetup.created;
}


//make sure the server is listening for requests.
app.listen(PORT, () => console.log(`App is up on ${PORT}`));
