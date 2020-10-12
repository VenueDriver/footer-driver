require 'colorize'
require 'filewatcher'

require_relative 'lib/footer-driver'

FooterDriver.build_all

puts ' Watching: '.white.on_black + ' templates/'

Filewatcher.new(['templates/']).watch do |filename, event|
  puts ' Change detected! '.white.on_red
  FooterDriver.build_all
  print "\a" # Ring the system bell as feedback.
end
