<?php

  function AUTHORIZATION_CONTENT() {
    ?>
      <div class="inout_auth">
        <label class="inout_login">
          <div>Login:</div>
          <input type="text" name="login" />
          <div class="inout_error"></div>
        </label>
        <label class="inout_password">
          <div>Password:</div>
          <input type="password" name="password" />
          <div class="inout_error"></div>
        </label>
        <div>
          <button class="inout_send">Send</button>
        </div>
        <a class="inout_reg_link">Registration</a>
        <a class="inout_forgot_link">Forgot password?</a>
      </div>
    <?php
  }
  
  function REGISTRATION_CONTENT() {
    ?>
      <div class="inout_reg">
        <label class="login">
          <div>Login:</div>
          <input type="text" name="login" />
          <div class="inout_error"></div>
        </label>
        <label class="password">
          <div>Password:</div>
          <input type="password" name="password" />
          <div class="inout_error"></div>
        </label>
        <label class="repeat">
          <div>Repeat:</div>
          <input type="password" name="password" />
          <div class="inout_error"></div>
        </label>
        <div>
          <button class="inout_send">Send</button>
        </div>
        <a class="inout_auth_link">Authorization</a>
      </div>
    <?php
  }

  function EXIT_CONTENT() {
    global $current_user;
    get_currentuserinfo()
    ?>
      <div class="inout_exit">
        <div>
          Hi, <?= $current_user->user_login ?> 
        </div>
        <a class="inout_exit_link">Exit</a>
      </div>
    <?php
  }

  function FORM_CONTENT($type = null) { 
  
    if(is_user_logged_in()) {
      return EXIT_CONTENT();     
    } else {
      return AUTHORIZATION_CONTENT();  
    }
  
  }

?>