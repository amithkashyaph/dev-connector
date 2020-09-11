import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import { removeComment } from "../../actions/post";
import Moment from "react-moment";
import { connect } from "react-redux";

const CommentItem = ({
  comment: { _id, text, name, avatar, date, user },
  postId,
  auth,
  removeComment,
}) => {
  return (
    <div class="post bg-white p-1 my-1">
      <div>
        <Link to={`/profile/${user}`}>
          <img class="round-img" src={avatar} alt="" />
          <h4>{name}</h4>
        </Link>
      </div>
      <div>
        <p class="my-1">{text}</p>
        <p class="post-date">
          Posted on <Moment format="DD/MM/YYYY">{date}</Moment>
        </p>
      </div>
      {!auth.loading && auth.user._id === user && (
        <button
          className="btn btn-danger"
          onClick={() => removeComment(postId, _id)}
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  postId: PropTypes.number.isRequired,
  auth: PropTypes.object.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});
export default connect(mapStateToProps, {
  removeComment,
})(CommentItem);
