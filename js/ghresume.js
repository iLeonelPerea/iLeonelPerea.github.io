(function() {
  var $, api_url, load_repos, load_user_info, username, write_repos, write_user_info;

  $ = jQuery;

  $.support.cors = true;

  api_url = "https://api.github.com/users/";

  username = url("?").replace(/^\/|\/$/g, '');

  if (!username) {
    username = "ileonelperea";
  }

  $(document).ready(function() {
    load_user_info(write_user_info);
    return load_repos(write_repos);
  });

  load_user_info = function(callback) {
    return $.getJSON(api_url + username + "?callback=?", callback);
  };

  load_repos = function(callback) {
    return $.getJSON(api_url + username + "/repos" + "?callback=?", callback);
  };

  write_user_info = function(response) {
    var avatar_url, followers, hireable, name, user;
    user = response.data;
    $(document).attr("title", user.login + "'s " + document.title);
    avatar_url = "https://secure.gravatar.com/avatar/" + user.gravatar_id + "?size=170";
    $("#avatar").attr("src", avatar_url);
    if (user.name) {
      name = user.name;
    } else {
      name = username;
    }
    $("#name").html("<a href=\"https://github.com/" + username + "\">" + name + "</a>");
    if (user.location) {
      $("ul#user-info").append("<li><i class=\"icon-map-marker icon-white\"></i>" + user.location + "</li>");
    }
    if (user.email) {
      $("ul#user-info").append("<li><i class=\"icon-envelope icon-white\"></i>" + user.email + "</li>");
    }
    if (user.company) {
      $("ul#user-info").append("<li><i class=\"icon-user icon-white\"></i>" + user.company + "</li>");
    }
    if (user.blog) {
      $("ul#user-info").append("<li><i class=\"icon-home icon-white\"></i><a href=\"" + user.blog + "\" >" + user.blog + "</a></li>");
    }
    if (user.followers >= 1000) {
      followers = (user.followers / 1000).toFixed(1) + "k";
    } else {
      followers = user.followers;
    }
    $("#follower-number").text(followers);
    if (user.hireable) {
      hireable = "YES";
      $("#hireable").css("background-color", "#199c4b");
    } else {
      hireable = "NO";
      $("#hireable").css("background-color", "#555");
    }
    return $("#hireable").text(hireable);
  };

  write_repos = function(response) {
    var count, homepage, key, lang, language, repo, repos, tuple_arr, value, _i, _j, _len, _len1, _ref;
    repos = response.data;
    repos.sort(function(a, b) {
      var ap, bp;
      ap = a.watchers_count + a.forks_count;
      bp = b.watchers_count + b.forks_count;
      return bp - ap;
    });
    _ref = repos.slice(0, 5);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      repo = _ref[_i];
      homepage = "";
      if (repo.homepage) {
        homepage = "<a href=\"" + repo.homepage + "\" ><i class=\"icon-home icon-white\" ></i></a>";
      }
      language = "";
      if (repo.language) {
        language = "<span id=\"language\"> (" + repo.language + ")</span>";
      }
      $("#repolist").append("\<li style=\"display: list-item;\" class=\"singlerepo\"><ul class=\"repo-stats\"><li class=\"stars\"><i class=\"icon-star icon-white\"></i>" + repo.watchers_count + "</li>\<li class=\"forks\"><i class=\"icon-share-alt icon-white\"></i>" + repo.forks_count + " </li>\<li class=\"created_time\"><i class=\"icon-time icon-white\"></i>" + repo.created_at.substring(0, 10) + "</li>\</ul>\<h3><a href=\"https://github.com/" + username + "/" + repo.name + "\">" + repo.name + language + " </a></h3>\<p id=\"description\">" + homepage + "&nbsp;" + repo.description + "</p></li>");
    }
    lang = [];
    count = 0;
    for (_j = 0, _len1 = repos.length; _j < _len1; _j++) {
      repo = repos[_j];
      if (repo.language) {
        if (!lang[repo.language]) {
          lang[repo.language] = 0;
        }
        lang[repo.language] += 1;
      }
      count += 1;
    }
    tuple_arr = [];
    for (key in lang) {
      value = lang[key];
      tuple_arr.push([key, value]);
    }
    tuple_arr.sort(function(a, b) {
      return b[1] - a[1];
    });
    $("#repos-count").text(count);
    $("h1#name").append("&nbsp; <span>(" + tuple_arr[0][0] + ")</span>");
    return $.getJSON("vendors/github-language-colors/colors.json", function(clr) {
      var item, l, n, _k, _len2, _ref1, _results;
      _ref1 = tuple_arr.slice(0, 6);
      _results = [];
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        item = _ref1[_k];
        l = item[0];
        n = item[1];
        _results.push($("#skills ul#lang-container").append("<li> <div style=\"background-color:" + clr[l] + "; \"> " + parseInt(n / count * 100) + "% </div><span>" + l + "</span></li>"));
      }
      return _results;
    });
  };

}).call(this);

// Generated by CoffeeScript 1.5.0-pre
